# Cartografía del poder de base

Comparador de la estructura orgánica y de los métodos de decisión de sindicatos, partidos y movimientos:
dónde reside el poder, y qué problemas de democracia, escalabilidad y agilidad tiene cada organización.

```
app/            aplicación web (Remix 3)
  lib/          lógica compartida servidor/navegador: índices, libro de códigos, cálculo de voto
  data/         lectura de data/orgs y de los pesos (cookie)
  actions/      controladores y páginas
  ui/           componentes; ui/public/ se ejecuta también en el navegador
data/orgs/      una ficha JSON por organización  ← los datos
analisis/       cuaderno de análisis (Python + marimo)
prototipo/      versión antigua en un solo HTML (solo referencia)
```

## Aplicación web

Requiere **Node.js 24.3 o superior**.

```sh
npm install
npm run dev        # http://localhost:44100, se reinicia al cambiar el código
npm test           # tests de rutas, datos y calculadora
npm run typecheck
npm start          # modo producción
```

Con Nix, `flake.nix` define el entorno (Node 26, uv y Python): `nix develop -c npm run dev`, o
`direnv allow` una vez para cargarlo al entrar en el directorio (`.envrc` hace `use flake`).

Páginas: `/` panorama, `/comparar?ids=cnt,cgt`, `/organizaciones/<id>`, `/calculadora`, `/metodo`.
Los datos con los índices calculados se sirven en `/api/orgs.json`.

## Añadir o corregir una organización

Copia cualquier archivo de `data/orgs/`, cambia el `id` y rellena los campos. El servidor lee los
archivos en cada petición: basta con recargar. `npm test` comprueba que todas las fichas son válidas
y que la cima del organigrama es alcanzable desde la base.

```jsonc
{
  "id": "cnt",                     // único, minúsculas, igual que el nombre del archivo
  "siglas": "CNT", "nombre": "…",
  "familia": "sindicato|movimiento|partido|cooperativa",
  "pais": "…", "fundacion": 1910,
  "tamano": [5000, "fuente o explicación", "alta|media|baja"],
  "resumen": "…", "poder_formal": "…", "poder_real": "…",
  "organos": [
    { "id": "af", "n": "Afiliación", "nivel": 0, "tipo": "base" },
    { "id": "sind", "n": "Asamblea", "nivel": 1,
      "tipo": "asamblea|delegados|coordinacion|ejecutivo|soberano|sectorial|tecnico|garantias|militar",
      "elegido_por": ["af"], "decide": "regla", "freq": "periodicidad", "desc": "…" },
    { "id": "sp", "n": "Secretariado", "nivel": 2, "tipo": "ejecutivo", "cima": true, "elegido_por": ["sind"] }
  ],
  "reglas": { "metodo": "", "ponderacion": "", "mandato": "", "cargos": "", "reforma": "", "minorias": "" },
  "codigos": {                      // [valor 0-4, justificación, confianza]
    "mandato": [4, "Art. 55 …", "alta"],
    "revocabilidad": [], "rotacion": [], "profesionalizacion": [], "eleccion_direccion": [],
    "agenda_base": [], "pluralismo": [], "autonomia_base": [], "brecha_formal_real": [],
    "regla_decision": [], "capacidad_ejecutiva": [], "estructura_federal": [], "coste_coordinacion": [],
    "freq_soberano_meses": [48, "", ""], "freq_intermedio_meses": [6, "", ""]
  },
  "problemas": [{ "t": "democratico|escalabilidad|agilidad", "x": "…" }],
  "fuentes": [{ "t": "título", "u": "https://…" }],
  "confianza": "alta|media|baja"
}
```

`saltos` y `proximidad` se calculan siguiendo `elegido_por` desde el órgano `base` hasta el marcado con
`cima`. El libro de códigos con los anclajes 0-4 está en la página «Método y datos».

## Análisis de datos

Con [uv](https://docs.astral.sh/uv/) (sustituye a conda/pip/venv) y [marimo](https://marimo.io)
(cuadernos reactivos guardados como `.py`):

```sh
cd analisis
uv sync                       # crea el entorno con las versiones de pyproject.toml / uv.lock
uv run marimo edit poder.py   # abre el cuaderno en el navegador
uv run marimo run poder.py    # lo abre como app de solo lectura, sin código
```

El cuaderno incluye la tabla larga de variables, los índices con pesos ajustables, la robustez del
ranking ante pesos aleatorios, PCA y agrupamiento, y análisis de redes de cada organigrama.

En NixOS, los paquetes con extensiones en C (numpy) necesitan `libstdc++` y `zlib`; `nix develop`
ya los pone en `LD_LIBRARY_PATH` y hace que uv use el Python de nixpkgs.
