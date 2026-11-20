# /// script
# requires-python = ">=3.12"
# dependencies = []
# ///
"""Fiabilidad entre codificadores del libro de códigos.

Lee la codificación de referencia (data/orgs/*.json) y todas las codificaciones independientes
(data/codificaciones/<codificador>/<org_id>.json) y calcula, por variable manual:

- alfa de Krippendorff ordinal (con intervalo bootstrap remuestreando organizaciones),
- % de acuerdo exacto y % a ±1 sobre todos los pares de codificadores de cada organización,

y, por organización, el índice de control de base (CB) que sale con cada codificación, calculado con
la lógica de la aplicación (app/lib/metrics.ts, vía node analisis/indices.ts).

Admite N codificadores y cobertura parcial: una organización entra en la variable si al menos dos
codificadores le dieron un valor no nulo.

Uso:  cd analisis && uv run fiabilidad.py [--boot 2000] [--test]
Salida: analisis/resultados/fiabilidad.md y analisis/resultados/fiabilidad_largo.csv
"""

from __future__ import annotations

import argparse
import csv
import itertools
import json
import random
import subprocess
import sys
from collections import defaultdict
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
ORGS = RAIZ / "data" / "orgs"
CODIF = RAIZ / "data" / "codificaciones"
SALIDA = Path(__file__).resolve().parent / "resultados"
PUENTE = Path(__file__).resolve().parent / "indices.ts"
REF = "referencia"

# Solo si node no está disponible: las 13 variables manuales del libro de códigos.
MANUALES_RESPALDO = [
    "mandato", "revocabilidad", "rotacion", "profesionalizacion", "eleccion_direccion",
    "agenda_base", "pluralismo", "autonomia_base", "brecha_formal_real", "regla_decision",
    "capacidad_ejecutiva", "estructura_federal", "coste_coordinacion",
]
CB_MANUALES = MANUALES_RESPALDO[:8]


# --------------------------------------------------------------------------------------------
# Alfa de Krippendorff
# --------------------------------------------------------------------------------------------

def alfa_ordinal(unidades: list[list[float]]) -> float | None:
    """Alfa de Krippendorff con métrica ordinal.

    `unidades`: una lista de valores por unidad (uno por codificador que la codificó). Las unidades con
    menos de dos valores no son emparejables y se descartan. Devuelve None si no hay variación
    esperada (todos los valores iguales), donde alfa no está definido.
    """
    unidades = [u for u in unidades if len(u) >= 2]
    if not unidades:
        return None
    # Matriz de coincidencias o_ck
    o: dict[tuple[float, float], float] = defaultdict(float)
    for u in unidades:
        m = len(u)
        for i, j in itertools.permutations(range(m), 2):
            o[(u[i], u[j])] += 1 / (m - 1)
    cats = sorted({c for c, _ in o})
    n_c = {c: sum(v for (a, _), v in o.items() if a == c) for c in cats}
    n = sum(n_c.values())
    if len(cats) < 2:
        return None
    # Distancia ordinal: (sum_{g=c..k} n_g - (n_c + n_k)/2)^2
    idx = {c: i for i, c in enumerate(cats)}

    def delta2(c: float, k: float) -> float:
        a, b = sorted((idx[c], idx[k]))
        s = sum(n_c[cats[g]] for g in range(a, b + 1))
        return (s - (n_c[c] + n_c[k]) / 2) ** 2

    d_o = sum(v * delta2(c, k) for (c, k), v in o.items())
    d_e = sum(n_c[c] * n_c[k] * delta2(c, k) for c in cats for k in cats)
    if d_e == 0:
        return None
    return 1 - (n - 1) * d_o / d_e


def bootstrap(unidades: list[list[float]], reps: int, rng: random.Random) -> tuple[float | None, float | None, int]:
    """Intervalo percentil 95 % remuestreando unidades con reemplazo. Devuelve (lo, hi, réplicas válidas)."""
    unidades = [u for u in unidades if len(u) >= 2]
    if len(unidades) < 2:
        return None, None, 0
    vals = []
    for _ in range(reps):
        a = alfa_ordinal([rng.choice(unidades) for _ in unidades])
        if a is not None:
            vals.append(a)
    if not vals:
        return None, None, 0
    vals.sort()
    return vals[int(0.025 * (len(vals) - 1))], vals[int(0.975 * (len(vals) - 1))], len(vals)


def autotest() -> None:
    """Ejemplo canónico de Krippendorff (4 codificadores, 12 unidades): ordinal = 0,815."""
    nan = None
    datos = [
        [1, 2, 3, 3, 2, 1, 4, 1, 2, nan, nan, nan],
        [1, 2, 3, 3, 2, 2, 4, 1, 2, 5, nan, 3],
        [nan, 3, 3, 3, 2, 3, 4, 2, 2, 5, 1, nan],
        [1, 2, 3, 3, 2, 4, 4, 1, 2, 5, 1, nan],
    ]
    unidades = [[fila[j] for fila in datos if fila[j] is not None] for j in range(12)]
    a = alfa_ordinal(unidades)
    assert a is not None and abs(a - 0.815) < 0.001, a
    print(f"autotest correcto: alfa ordinal = {a:.4f} (esperado 0,815)")


# --------------------------------------------------------------------------------------------
# Datos
# --------------------------------------------------------------------------------------------

def libro() -> list[dict]:
    try:
        r = subprocess.run(["node", str(PUENTE), "--vars"], capture_output=True, text=True, check=True, cwd=RAIZ)
        return json.loads(r.stdout)
    except (OSError, subprocess.CalledProcessError, json.JSONDecodeError) as e:
        print(f"aviso: no se pudo leer el libro de códigos con node ({e}); uso la lista fija", file=sys.stderr)
        return [{"k": k, "l": k, "g": "CB" if k in CB_MANUALES else "?"} for k in MANUALES_RESPALDO]


def valor(c) -> int | None:
    if isinstance(c, list) and c and isinstance(c[0], (int, float)) and not isinstance(c[0], bool):
        return int(c[0])
    return None


def cargar(manuales: list[str]):
    """Devuelve (fichas de referencia, codificaciones[(coder, org)] = {var: [v, just, conf]}, metadatos, avisos)."""
    avisos: list[str] = []
    fichas = {}
    for f in sorted(ORGS.glob("*.json")):
        o = json.loads(f.read_text(encoding="utf8"))
        fichas[o["id"]] = o
    cod: dict[tuple[str, str], dict] = {}
    meta: dict[str, dict] = {REF: {"tipo": "humano", "nombre": "codificación de referencia (data/orgs)"}}
    for oid, o in fichas.items():
        cod[(REF, oid)] = {k: o["codigos"].get(k) for k in manuales}
    if CODIF.exists():
        for carpeta in sorted(p for p in CODIF.iterdir() if p.is_dir()):
            coder = carpeta.name
            for f in sorted(carpeta.glob("*.json")):
                try:
                    d = json.loads(f.read_text(encoding="utf8"))
                except json.JSONDecodeError as e:
                    avisos.append(f"{f.relative_to(RAIZ)}: JSON no válido ({e}); se ignora")
                    continue
                oid = d.get("org_id") or f.stem
                if oid != f.stem:
                    avisos.append(f"{f.relative_to(RAIZ)}: org_id «{oid}» no coincide con el archivo; uso «{f.stem}»")
                    oid = f.stem
                if oid not in fichas:
                    avisos.append(f"{f.relative_to(RAIZ)}: no hay ficha data/orgs/{oid}.json; se ignora")
                    continue
                c = d.get("codificador") or {}
                if c.get("id") and c["id"] != coder:
                    avisos.append(f"{f.relative_to(RAIZ)}: codificador.id «{c['id']}» ≠ carpeta «{coder}»; manda la carpeta")
                meta.setdefault(coder, {"tipo": c.get("tipo", "?"), "nombre": c.get("nombre", coder),
                                        "modelo": c.get("modelo"), "ciegas": set()})
                meta[coder]["ciegas"].add(bool(d.get("a_ciegas")))
                codigos = d.get("codigos") or {}
                for k in manuales:
                    v = valor(codigos.get(k))
                    if v is not None and not 0 <= v <= 4:
                        avisos.append(f"{f.relative_to(RAIZ)}: {k} = {v} fuera de 0-4; se ignora")
                        codigos[k] = None
                faltan = [k for k in manuales if k not in codigos]
                if faltan:
                    avisos.append(f"{f.relative_to(RAIZ)}: faltan {', '.join(faltan)}")
                cod[(coder, oid)] = {k: codigos.get(k) for k in manuales}
    return fichas, cod, meta, avisos


def indices(fichas: dict, cod: dict, manuales: list[str]) -> dict[tuple[str, str], dict] | None:
    """CB y demás índices de cada (codificador, org), sustituyendo en la ficha de referencia los códigos
    manuales de ese codificador (organigrama, frecuencias y tamaño se mantienen)."""
    lote, claves = [], []
    for (coder, oid), cods in cod.items():
        o = json.loads(json.dumps(fichas[oid]))
        o["id"] = f"{coder}::{oid}"
        for k in manuales:
            if valor(cods.get(k)) is None:
                o["codigos"].pop(k, None)  # sin dato: la variable se descarta de su media, como en la app
            else:
                o["codigos"][k] = cods[k]
        lote.append(o)
        claves.append((coder, oid))
    try:
        r = subprocess.run(["node", str(PUENTE)], input=json.dumps(lote), capture_output=True,
                           text=True, check=True, cwd=RAIZ)
    except (OSError, subprocess.CalledProcessError) as e:
        err = getattr(e, "stderr", "") or str(e)
        print(f"aviso: no se pudieron calcular los índices con node:\n{err}", file=sys.stderr)
        return None
    return {k: v for k, v in zip(claves, json.loads(r.stdout))}


# --------------------------------------------------------------------------------------------
# Informe
# --------------------------------------------------------------------------------------------

def f2(x: float | None, d: int = 2) -> str:
    return "—" if x is None else f"{x:.{d}f}".replace(".", ",")


def pct(a: int, b: int) -> str:
    return "—" if not b else f"{100 * a / b:.0f} %"


def veredicto(a: float | None) -> str:
    if a is None:
        return "no definido"
    return "buena" if a >= 0.8 else "tentativa" if a >= 0.667 else "insuficiente"


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--boot", type=int, default=2000, help="réplicas bootstrap (0 = sin intervalo)")
    ap.add_argument("--semilla", type=int, default=1)
    ap.add_argument("--test", action="store_true", help="solo comprobar la implementación del alfa")
    args = ap.parse_args()
    autotest()
    if args.test:
        return

    vars_ = libro()
    manuales = [v["k"] for v in vars_ if not v.get("calc")]
    etiqueta = {v["k"]: v.get("l", v["k"]) for v in vars_}
    grupo = {v["k"]: v.get("g", "") for v in vars_}
    fichas, cod, meta, avisos = cargar(manuales)
    coders = sorted({c for c, _ in cod}, key=lambda c: (c != REF, c))
    orgs_por_coder = {c: sorted(o for cc, o in cod if cc == c) for c in coders}
    # Organizaciones con al menos un codificador además de la referencia
    orgs = sorted({o for c, o in cod if c != REF})
    rng = random.Random(args.semilla)

    def unidades(k: str, solo: list[str] | None = None) -> list[list[int]]:
        out = []
        for o in orgs:
            vs = [valor(cod[(c, o)].get(k)) for c in coders if (c, o) in cod and (solo is None or c in solo)]
            vs = [v for v in vs if v is not None]
            if len(vs) >= 2:
                out.append(vs)
        return out

    def acuerdo(us: list[list[int]]) -> tuple[int, int, int]:
        ex = uno = tot = 0
        for u in us:
            for a, b in itertools.combinations(u, 2):
                tot += 1
                ex += a == b
                uno += abs(a - b) <= 1
        return ex, uno, tot

    L: list[str] = []
    L.append("# Fiabilidad entre codificadores\n")
    L.append("Generado por `analisis/fiabilidad.py`. No editar a mano.\n")
    L.append("## Codificadores\n")
    L.append("| codificador | tipo | organizaciones | a ciegas |")
    L.append("|---|---|---|---|")
    for c in coders:
        m = meta[c]
        tipo = m["tipo"] + (f" ({m['modelo']})" if m.get("modelo") else "")
        n = len(orgs_por_coder[c]) if c != REF else f"{len(orgs_por_coder[c])} (todas)"
        ciegas = "—" if c == REF else ("sí" if m["ciegas"] == {True} else "no" if m["ciegas"] == {False} else "mixto")
        L.append(f"| {c} | {tipo} | {n} | {ciegas} |")
    L.append(f"\nOrganizaciones con más de un codificador ({len(orgs)}): {', '.join(orgs) or 'ninguna'}.\n")
    if avisos:
        L.append("Avisos al leer los datos:\n")
        L.extend(f"- {a}" for a in avisos)
        L.append("")
    if not orgs:
        L.append("No hay codificaciones independientes todavía.")
        SALIDA.mkdir(exist_ok=True)
        (SALIDA / "fiabilidad.md").write_text("\n".join(L) + "\n", encoding="utf8")
        print("\n".join(L))
        return

    # ---- por variable
    L.append("## Por variable\n")
    L.append(f"Alfa de Krippendorff ordinal; intervalo bootstrap del 95 % remuestreando organizaciones "
             f"({args.boot} réplicas). Acuerdo sobre todos los pares de codificadores de cada organización. "
             "Umbrales habituales: α ≥ 0,800 buena, ≥ 0,667 tentativa.\n")
    L.append("| variable | grupo | n org | α ordinal | IC 95 % | acuerdo exacto | a ±1 | fiabilidad |")
    L.append("|---|---|---|---|---|---|---|---|")
    filas_var = []
    for k in manuales:
        us = unidades(k)
        a = alfa_ordinal(us)
        lo, hi, nb = bootstrap(us, args.boot, rng) if args.boot else (None, None, 0)
        ex, uno, tot = acuerdo(us)
        filas_var.append((k, a, ex, uno, tot))
        ic = "—" if lo is None else f"[{f2(lo)}, {f2(hi)}]" + ("" if nb == args.boot else f" ({nb} válidas)")
        L.append(f"| {etiqueta[k]} (`{k}`) | {grupo[k]} | {len(us)} | {f2(a, 3)} | {ic} | {pct(ex, tot)} | "
                 f"{pct(uno, tot)} | {veredicto(a)} |")

    # ---- agregados
    def agregado(keys: list[str]) -> tuple[list[list[int]], list[list[list[int]]]]:
        """Unidades organización × variable; para el bootstrap se agrupan por organización."""
        por_org = []
        for o in orgs:
            g = []
            for k in keys:
                vs = [valor(cod[(c, o)].get(k)) for c in coders if (c, o) in cod]
                vs = [v for v in vs if v is not None]
                if len(vs) >= 2:
                    g.append(vs)
            por_org.append(g)
        return [u for g in por_org for u in g], por_org

    L.append("\nAgregados (cada par organización × variable es una unidad; el bootstrap remuestrea organizaciones):\n")
    L.append("| conjunto | unidades | α ordinal | IC 95 % | acuerdo exacto | a ±1 |")
    L.append("|---|---|---|---|---|---|")
    cb_keys = [k for k in manuales if grupo[k] == "CB"]
    for nombre, keys in [("las 13 manuales", manuales), ("las 8 de control de base", cb_keys),
                         ("CB + brecha (las que entran en CB)", cb_keys + ["brecha_formal_real"])]:
        us, por_org = agregado(keys)
        a = alfa_ordinal(us)
        vals = []
        for _ in range(args.boot):
            muestra = [u for g in (rng.choice(por_org) for _ in por_org) for u in g]
            b = alfa_ordinal(muestra)
            if b is not None:
                vals.append(b)
        vals.sort()
        ic = f"[{f2(vals[int(0.025 * (len(vals) - 1))])}, {f2(vals[int(0.975 * (len(vals) - 1))])}]" if vals else "—"
        ex, uno, tot = acuerdo(us)
        L.append(f"| {nombre} | {len(us)} | {f2(a, 3)} | {ic} | {pct(ex, tot)} | {pct(uno, tot)} |")

    # ---- cada codificador frente a la referencia
    L.append("\n## Cada codificador frente a la referencia\n")
    L.append("Sesgo = media de (codificador − referencia): positivo si puntúa más alto.\n")
    L.append("| codificador | org | pares | exacto | a ±1 | sesgo medio | α ordinal (2 codificadores) |")
    L.append("|---|---|---|---|---|---|---|")
    for c in coders:
        if c == REF:
            continue
        ex = uno = tot = 0
        dif = []
        for o in orgs_por_coder[c]:
            for k in manuales:
                a_, b_ = valor(cod[(c, o)].get(k)), valor(cod[(REF, o)].get(k))
                if a_ is None or b_ is None:
                    continue
                tot += 1
                ex += a_ == b_
                uno += abs(a_ - b_) <= 1
                dif.append(a_ - b_)
        us = [[valor(cod[(REF, o)].get(k)), valor(cod[(c, o)].get(k))] for o in orgs_por_coder[c] for k in manuales]
        us = [u for u in us if None not in u]
        L.append(f"| {c} | {len(orgs_por_coder[c])} | {tot} | {pct(ex, tot)} | {pct(uno, tot)} | "
                 f"{f2(sum(dif) / len(dif) if dif else None)} | {f2(alfa_ordinal(us), 3)} |")

    # ---- índice CB por organización
    ind = indices(fichas, cod, manuales)
    L.append("\n## Índice de control de base (CB) con cada codificación\n")
    if ind is None:
        L.append("No se pudo calcular (node falló; ver stderr).")
    else:
        L.append("CB calculado con `app/lib/metrics.ts` y los pesos por defecto, sustituyendo en la ficha de "
                 "referencia los 13 códigos manuales de cada codificador (organigrama, frecuencias y tamaño "
                 "son los de la ficha). Posición = puesto en el ranking de CB de todas las fichas de referencia "
                 "si solo esa organización usara esa codificación.\n")
        ref_cb = {o: ind[(REF, o)]["cb"] for o in fichas}

        def puesto(oid: str, cb: float | None) -> str:
            if cb is None:
                return "—"
            otros = [v for o, v in ref_cb.items() if o != oid and v is not None]
            return f"{1 + sum(v > cb for v in otros)}/{len(otros) + 1}"

        otros_coders = [c for c in coders if c != REF]
        L.append("| org | " + " | ".join(f"CB {c}" for c in coders) + " | Δ máx. | " +
                 " | ".join(f"puesto {c}" for c in coders) + " |")
        L.append("|---|" + "---|" * (2 * len(coders) + 1))
        for o in orgs:
            cbs = [ind[(c, o)]["cb"] if (c, o) in ind else None for c in coders]
            r = ref_cb[o]
            dmax = max((abs(x - r) for x in cbs[1:] if x is not None and r is not None), default=None)
            L.append(f"| {o} | " + " | ".join(f2(x, 1) for x in cbs) + f" | {f2(dmax, 1)} | " +
                     " | ".join(puesto(o, x) for x in cbs) + " |")
        for c in otros_coders:
            ds = [ind[(c, o)]["cb"] - ref_cb[o] for o in orgs_por_coder[c]
                  if ind[(c, o)]["cb"] is not None and ref_cb[o] is not None]
            if ds:
                L.append(f"\n{c}: diferencia media de CB {f2(sum(ds) / len(ds), 1)} puntos; "
                         f"absoluta media {f2(sum(map(abs, ds)) / len(ds), 1)} (escala 0-100).")

    # ---- desacuerdos
    L.append("\n## Desacuerdos de 2 o más puntos\n")
    filas = []
    for o in orgs:
        for k in manuales:
            vs = {c: cod[(c, o)].get(k) for c in coders if (c, o) in cod and valor(cod[(c, o)].get(k)) is not None}
            if len(vs) < 2:
                continue
            nums = [valor(v) for v in vs.values()]
            if max(nums) - min(nums) >= 2:
                filas.append((max(nums) - min(nums), o, k, vs))
    filas.sort(key=lambda t: (-t[0], t[1], t[2]))
    if not filas:
        L.append("Ninguno.")
    for d, o, k, vs in filas:
        L.append(f"### {o} · {etiqueta[k]} (`{k}`) — diferencia {d}\n")
        for c, v in vs.items():
            just = v[1] if len(v) > 1 else ""
            conf = v[2] if len(v) > 2 else ""
            L.append(f"- **{c}: {v[0]}** ({conf}). {just}")
        L.append("")

    SALIDA.mkdir(exist_ok=True)
    (SALIDA / "fiabilidad.md").write_text("\n".join(L) + "\n", encoding="utf8")
    with open(SALIDA / "fiabilidad_largo.csv", "w", newline="", encoding="utf8") as fh:
        w = csv.writer(fh)
        w.writerow(["org", "variable", "codificador", "valor", "confianza", "justificacion"])
        for (c, o), cods in sorted(cod.items()):
            if o not in orgs:
                continue
            for k in manuales:
                v = cods.get(k)
                if isinstance(v, list):
                    w.writerow([o, k, c, valor(v), v[2] if len(v) > 2 else "", v[1] if len(v) > 1 else ""])
    print("\n".join(L))
    print(f"\nEscrito {SALIDA / 'fiabilidad.md'} y {SALIDA / 'fiabilidad_largo.csv'}", file=sys.stderr)


if __name__ == "__main__":
    main()
