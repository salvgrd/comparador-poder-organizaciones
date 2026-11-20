import { createController } from 'remix/router'

import { getOrgs } from '../../data/orgs.ts'
import { leerPesos } from '../../data/pesos.ts'
import { conIndices } from '../../lib/metrics.ts'
import { routes } from '../../routes.ts'
import { DetailPage } from './detail-page.tsx'
import { RevisionPage } from './revision-page.tsx'

export default createController(routes.organizaciones, {
  actions: {
    async show(context) {
      let todas = conIndices(await getOrgs(), await leerPesos(context.request))
      let o = todas.find((x) => x.id === context.params.id)
      if (!o) return new Response('Organización no encontrada', { status: 404 })
      return context.render(<DetailPage o={o} todas={todas} />)
    },

    async revision(context) {
      let todas = conIndices(await getOrgs(), await leerPesos(context.request))
      let o = todas.find((x) => x.id === context.params.id)
      if (!o) return new Response('Organización no encontrada', { status: 404 })
      return context.render(<RevisionPage o={o} />)
    },
  },
})
