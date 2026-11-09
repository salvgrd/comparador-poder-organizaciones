import { createController } from 'remix/router'

import { assets } from '../assets.ts'
import { getOrgs } from '../data/orgs.ts'
import { leerPesos } from '../data/pesos.ts'
import { conIndices } from '../lib/metrics.ts'
import { UNIDADES_EJEMPLO } from '../lib/voting.ts'
import { routes } from '../routes.ts'
import { CLAVES_ORDEN, type ClaveOrden } from '../ui/tables.tsx'
import { CalculadoraPage } from './calculadora-page.tsx'
import { CompararPage } from './comparar-page.tsx'
import { MetodoPage } from './metodo-page.tsx'
import { PanoramaPage } from './panorama-page.tsx'

const MAX_COMPARAR = 3

export default createController(routes, {
  actions: {
    async assets(context) {
      return (await assets.fetch(context.request)) ?? new Response('Not Found', { status: 404 })
    },

    async home(context) {
      let orgs = conIndices(await getOrgs(), await leerPesos(context.request))
      let q = context.url.searchParams
      let orden = (CLAVES_ORDEN as string[]).includes(q.get('orden') ?? '') ? (q.get('orden') as ClaveOrden) : 'cb'
      let dir: 1 | -1 = q.get('dir') === 'asc' ? 1 : -1
      return context.render(<PanoramaPage orgs={orgs} orden={orden} dir={dir} />)
    },

    async comparar(context) {
      let orgs = conIndices(await getOrgs(), await leerPesos(context.request))
      let param = context.url.searchParams.get('ids')
      let ids = (param == null ? ['cnt', 'cgt', 'ccoo'] : param.split(','))
        .filter((id) => orgs.some((o) => o.id === id))
        .slice(0, MAX_COMPARAR)
      return context.render(<CompararPage orgs={orgs} ids={ids} max={MAX_COMPARAR} />)
    },

    calculadora(context) {
      return context.render(<CalculadoraPage unidades={UNIDADES_EJEMPLO} />)
    },

    async metodo(context) {
      let pesos = await leerPesos(context.request)
      let guardado = context.url.searchParams.get('guardado')
      return context.render(<MetodoPage pesos={pesos} guardado={guardado} />)
    },

    async apiOrgs(context) {
      let orgs = conIndices(await getOrgs(), await leerPesos(context.request))
      return Response.json({
        generado: new Date().toISOString(),
        orgs: orgs.map(({ indices, ...o }) => ({
          ...o,
          indices: {
            control_base: indices.cb,
            control_base_bruto: indices.cbBruto,
            agilidad: indices.ag,
            escalabilidad: indices.es,
            riesgo_oligarquico: indices.olig,
            saltos: indices.hops,
          },
        })),
      })
    },
  },
})
