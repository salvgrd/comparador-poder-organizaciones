import marimo

__generated_with = "0.25.2"
app = marimo.App(width="medium", app_title="Análisis del poder organizativo")


@app.cell
def _():
    import json
    import math

    import altair as alt
    import marimo as mo
    import networkx as nx
    import numpy as np
    import polars as pl

    return alt, json, math, mo, np, nx, pl


@app.cell
def _(mo):
    mo.md(r"""
    # Análisis del poder organizativo

    Este cuaderno lee las mismas fichas que la app (`data/orgs/*.json`) y permite ir más allá de los índices fijos:

    1. **Tabla ordenada** de todas las variables codificadas, lista para filtrar o exportar.
    2. **Índices recalculados** con pesos ajustables (deslizadores).
    3. **Robustez del ranking**: ¿cambia el orden si los pesos fueran otros?
    4. **Tipologías**: análisis de componentes principales y agrupamiento de organizaciones parecidas.
    5. **Redes**: qué órganos son cuellos de botella en cada organigrama.

    Las celdas se recalculan solas al cambiar cualquier control. Si editas una ficha JSON, vuelve a ejecutar la celda de carga.
    """)
    return


@app.cell
def _(json, mo):
    DATA = mo.notebook_dir().parent / "data" / "orgs"
    orgs = [json.loads(p.read_text(encoding="utf-8")) for p in sorted(DATA.glob("*.json"))]
    mo.md(f"Cargadas **{len(orgs)}** organizaciones desde `{DATA}`.")
    return (orgs,)


@app.cell
def _(mo):
    mo.md(r"""
    ## 1. Variables codificadas (formato largo)

    Una fila por organización y variable, con su valor 0-4, la confianza y la justificación. Es el formato más cómodo para filtrar, pivotar o exportar a CSV.
    """)
    return


@app.cell
def _(orgs, pl):
    codigos = pl.DataFrame(
        [
            {
                "org": o["id"],
                "siglas": o["siglas"],
                "familia": o["familia"],
                "variable": k,
                "valor": float(v[0]),
                "justificacion": v[1],
                "confianza": v[2],
            }
            for o in orgs
            for k, v in o["codigos"].items()
        ]
    )
    codigos
    return (codigos,)


@app.cell
def _(mo):
    mo.md(r"""
    ## 2. Índices con pesos ajustables

    Misma fórmula que la app. Mueve los pesos del índice de **control de base** (0 = la variable no cuenta).
    """)
    return


@app.cell
def _(mo):
    CB_KEYS = [
        "mandato",
        "revocabilidad",
        "rotacion",
        "profesionalizacion",
        "eleccion_direccion",
        "agenda_base",
        "pluralismo",
        "autonomia_base",
        "proximidad",
    ]
    pesos_ui = mo.ui.dictionary(
        {k: mo.ui.slider(0, 3, step=0.5, value=1, label=k) for k in CB_KEYS}
    )
    pesos_ui
    return CB_KEYS, pesos_ui


@app.cell
def _(CB_KEYS, math, nx):
    def grafo(o):
        """Grafo dirigido «elige a»: arista de quien elige al órgano elegido."""
        g = nx.DiGraph()
        for n in o["organos"]:
            g.add_node(n["id"], **n)
            for src in n.get("elegido_por", []):
                g.add_edge(src, n["id"])
        return g

    def saltos(o):
        g = grafo(o)
        base = [n["id"] for n in o["organos"] if n["tipo"] == "base"]
        cima = next((n["id"] for n in o["organos"] if n.get("cima")), None)
        dist = [nx.shortest_path_length(g, b, cima) for b in base if cima and nx.has_path(g, b, cima)]
        return min(dist) if dist else None

    def _clamp(x, a, b):
        return max(a, min(b, x))

    UNIDADES_COMPARABLES = {"afiliacion", "trabajadoras", "activistas"}

    def _freq(m):
        if m is None:
            return None
        return 4 if m <= 0.25 else 3 if m <= 2 else 2 if m <= 6 else 1 if m <= 12 else 0

    def _proximidad(h, mandato, revoc):
        ctrl = [x for x in (mandato, revoc) if x is not None]
        if h is None or not ctrl:
            return None
        c = sum(ctrl) / (4 * len(ctrl))
        return 4 * c ** max(1, h)

    def valores(o):
        """Valores 0-4 de todas las variables, incluidas las calculadas. Misma lógica que app/lib/metrics.ts."""
        c = {k: v[0] for k, v in o["codigos"].items()}
        h = saltos(o)
        t = o.get("tamano", [None])[0]
        comparable = o.get("tamano_unidad", "afiliacion") in UNIDADES_COMPARABLES
        c["proximidad"] = _proximidad(h, c.get("mandato"), c.get("revocabilidad"))
        c["freq_intermedio"] = _freq(c.get("freq_intermedio_meses"))
        c["freq_soberano"] = _freq(c.get("freq_soberano_meses"))
        c["niveles_s"] = None if h is None else _clamp(5 - h, 0, 4)
        c["tamano_s"] = _clamp(math.log10(t) - 2, 0, 4) if t and comparable else None
        c["saltos"] = h
        return c

    def indices(o, pesos):
        v = valores(o)
        num = sum(pesos[k] * v[k] for k in CB_KEYS if v.get(k) is not None)
        den = sum(pesos[k] for k in CB_KEYS if v.get(k) is not None)
        brecha = v.get("brecha_formal_real")
        cb = num / den * 25 * (1 - 0.5 * brecha / 4) if den and brecha is not None else None

        def media(ks):
            xs = [v[k] for k in ks if v.get(k) is not None]
            return sum(xs) / len(xs) * 25 if xs else None

        olig_vars = [v.get(k) for k in ("profesionalizacion", "rotacion", "eleccion_direccion")]
        tam = v["tamano_s"]
        olig = (
            None
            if None in olig_vars or brecha is None or tam is None
            else (sum(4 - x for x in olig_vars) + brecha) / 16 * (0.5 + 0.5 * tam / 4) * 100
        )
        via_base = media(["freq_intermedio", "freq_soberano", "niveles_s"])
        via_direccion = media(["regla_decision", "capacidad_ejecutiva"])
        return {
            "control_base": cb,
            # Agilidad = media de sus dos vías: órganos colectivos rápidos o una dirección que decide sola.
            "agilidad": None if via_base is None or via_direccion is None else (via_base + via_direccion) / 2,
            "agilidad_via_base": via_base,
            "centralizacion_ejecutiva": via_direccion,
            "escalabilidad": media(["estructura_federal", "coste_coordinacion"]),
            "riesgo_oligarquico": olig,
            "saltos": v["saltos"],
        }

    return grafo, indices, valores


@app.cell
def _(indices, orgs, pesos_ui, pl):
    tabla = pl.DataFrame(
        [
            {"siglas": o["siglas"], "familia": o["familia"], "tamano": o.get("tamano", [None])[0], **indices(o, pesos_ui.value)}
            for o in orgs
        ]
    ).sort("control_base", descending=True)
    tabla
    return (tabla,)


@app.cell
def _(alt, mo, tabla):
    _base = alt.Chart(tabla).encode(
        x=alt.X("control_base", title="Control de base", scale=alt.Scale(domain=[0, 100])),
        y=alt.Y("agilidad", title="Agilidad", scale=alt.Scale(domain=[0, 100])),
    )
    _chart = (
        _base.mark_circle(opacity=0.85).encode(
            color=alt.Color("familia", title="Familia"),
            size=alt.Size("tamano", scale=alt.Scale(type="log"), legend=None),
            tooltip=["siglas", "control_base", "agilidad", "agilidad_via_base", "centralizacion_ejecutiva", "escalabilidad", "saltos"],
        )
        + _base.mark_text(align="left", dx=8).encode(text="siglas")
    ).properties(width=560, height=380, title="Control de base frente a agilidad")
    mo.ui.altair_chart(_chart)
    return


@app.cell
def _(mo):
    mo.md(r"""
    ## 3. ¿Es robusto el ranking?

    Los pesos son una decisión política, no un dato. Esta celda genera miles de combinaciones de pesos al azar (distribución de Dirichlet, media 1 por variable; puede dar pesos mayores que el máximo de 3 de la app) y mira en qué puesto queda cada organización en control de base. Si el rango de puestos es estrecho, la conclusión no depende de los pesos elegidos.

    Esto mide la sensibilidad a los **pesos**. La incertidumbre de los **códigos** (según su confianza) la calcula la app y la publica en `/api/orgs.json` como `intervalos_90`.
    """)
    return


@app.cell
def _(mo):
    n_sim = mo.ui.slider(200, 5000, step=200, value=2000, label="Simulaciones")
    n_sim
    return (n_sim,)


@app.cell
def _(CB_KEYS, indices, n_sim, np, orgs, pl):
    _rng = np.random.default_rng(42)
    _filas = []
    for _sim in range(n_sim.value):
        _w = dict(zip(CB_KEYS, _rng.dirichlet(np.ones(len(CB_KEYS))) * len(CB_KEYS)))
        _cb = {o["siglas"]: indices(o, _w)["control_base"] for o in orgs}
        _cb = {s: x for s, x in _cb.items() if x is not None}
        # Los empates comparten el mejor puesto, como en la app.
        _filas += [{"sim": _sim, "siglas": s, "puesto": 1 + sum(y > x + 1e-9 for y in _cb.values())} for s, x in _cb.items()]
    robustez = (
        pl.DataFrame(_filas)
        .group_by("siglas")
        .agg(
            pl.col("puesto").median().alias("puesto_mediano"),
            pl.col("puesto").quantile(0.05).alias("p5"),
            pl.col("puesto").quantile(0.95).alias("p95"),
            (pl.col("puesto") == 1).mean().alias("prob_primero"),
        )
        .sort("puesto_mediano")
    )
    robustez
    return


@app.cell
def _(mo):
    mo.md(r"""
    ## 4. Tipologías: ¿qué organizaciones se parecen?

    Componentes principales (PCA) sobre las variables 0-4, y agrupamiento k-means. Sirve para ver si las familias formales (sindicato, partido, movimiento) coinciden con los tipos reales de estructura de poder.

    Con unas 19 organizaciones y 17 variables, es exploratorio: los grupos cambian con poco que cambien los datos. Los datos que faltan se imputan con la media de la variable, no con 0.
    """)
    return


@app.cell
def _(mo):
    k_ui = mo.ui.slider(2, 6, value=3, label="Número de grupos (k)")
    k_ui
    return (k_ui,)


@app.cell
def _(alt, k_ui, mo, np, orgs, pl, valores):
    from sklearn.cluster import KMeans
    from sklearn.decomposition import PCA

    VARS = [
        "mandato", "revocabilidad", "rotacion", "profesionalizacion", "eleccion_direccion",
        "agenda_base", "pluralismo", "autonomia_base", "proximidad", "brecha_formal_real",
        "regla_decision", "capacidad_ejecutiva", "freq_intermedio", "freq_soberano", "niveles_s",
        "estructura_federal", "coste_coordinacion", "tamano_s",
    ]
    _X = np.array([[valores(o).get(k) for k in VARS] for o in orgs], dtype=float)
    _X = np.where(np.isnan(_X), np.nanmean(_X, axis=0), _X)
    _X = (_X - _X.mean(0)) / (_X.std(0) + 1e-9)
    _pca = PCA(n_components=2).fit(_X)
    _xy = _pca.transform(_X)
    _grupos = KMeans(n_clusters=k_ui.value, n_init=20, random_state=0).fit_predict(_X)
    tipos = pl.DataFrame(
        {
            "siglas": [o["siglas"] for o in orgs],
            "familia": [o["familia"] for o in orgs],
            "pc1": _xy[:, 0],
            "pc2": _xy[:, 1],
            "grupo": [f"Grupo {g + 1}" for g in _grupos],
        }
    )
    cargas = pl.DataFrame({"variable": VARS, "pc1": _pca.components_[0], "pc2": _pca.components_[1]}).sort(
        pl.col("pc1").abs(), descending=True
    )
    _b = alt.Chart(tipos).encode(x="pc1", y="pc2")
    _chart = (
        _b.mark_point(size=120, filled=True).encode(color="grupo", shape="familia", tooltip=["siglas", "familia", "grupo"])
        + _b.mark_text(align="left", dx=8).encode(text="siglas")
    ).properties(
        width=560,
        height=360,
        title=f"PCA: {_pca.explained_variance_ratio_.sum():.0%} de la varianza en 2 componentes",
    )
    mo.vstack([mo.ui.altair_chart(_chart), mo.md("**Variables que más pesan en cada componente**"), cargas])
    return


@app.cell
def _(mo):
    mo.md(r"""
    ## 5. Cuellos de botella en el organigrama

    Cada organigrama es un grafo «elige a». La **intermediación** (betweenness) de un órgano mide cuántos caminos de elección entre la base y el resto pasan por él: los valores altos señalan los órganos por los que tiene que pasar todo el poder delegado.
    """)
    return


@app.cell
def _(mo, orgs):
    org_ui = mo.ui.dropdown({o["siglas"]: o["id"] for o in orgs}, value=orgs[0]["siglas"], label="Organización")
    org_ui
    return (org_ui,)


@app.cell
def _(grafo, nx, org_ui, orgs, pl):
    _o = next(o for o in orgs if o["id"] == org_ui.value)
    _g = grafo(_o)
    _bt = nx.betweenness_centrality(_g, normalized=True)
    _base = [n["id"] for n in _o["organos"] if n["tipo"] == "base"]
    _dist = {}
    for _b in _base:
        for _k, _d in nx.single_source_shortest_path_length(_g, _b).items():
            _dist[_k] = min(_d, _dist.get(_k, _d))
    pl.DataFrame(
        [
            {
                "organo": n["n"],
                "tipo": n["tipo"],
                "cima": bool(n.get("cima")),
                "saltos_desde_base": _dist.get(n["id"]),
                "intermediacion": round(_bt[n["id"]], 3),
                "elige_a": _g.out_degree(n["id"]),
            }
            for n in _o["organos"]
        ]
    ).sort("intermediacion", descending=True)
    return


if __name__ == "__main__":
    app.run()
