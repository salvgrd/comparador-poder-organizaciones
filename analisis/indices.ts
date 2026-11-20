// Puente para fiabilidad.py: lee de stdin una lista JSON de fichas y devuelve sus índices calculados
// con la misma lógica que la aplicación (app/lib/metrics.ts) y los pesos por defecto.
// Uso: node analisis/indices.ts < fichas.json
//      node analisis/indices.ts --vars        (vuelca el libro de códigos)
import { PESOS_POR_DEFECTO, VARS } from '../app/lib/codebook.ts'
import { calcularIndices } from '../app/lib/metrics.ts'
import type { Org } from '../app/lib/types.ts'

if (process.argv.includes('--vars')) {
  process.stdout.write(JSON.stringify(VARS))
  process.exit(0)
}

let entrada = ''
for await (let trozo of process.stdin) entrada += trozo
let orgs = JSON.parse(entrada) as Org[]
let salida = orgs.map((o) => {
  let { cb, cbBruto, ag, es, olig, brecha, hops } = calcularIndices(o, PESOS_POR_DEFECTO)
  return { id: o.id, cb, cbBruto, ag, es, olig, brecha, hops }
})
process.stdout.write(JSON.stringify(salida))
