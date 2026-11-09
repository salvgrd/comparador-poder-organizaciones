import { formData } from 'remix/middleware/form-data'
import { render } from 'remix/middleware/render'
import { staticFiles } from 'remix/middleware/static'
import { createRouter, type RouterContext } from 'remix/router'

import controller from './actions/controller.tsx'
import organizacionesController from './actions/organizaciones/controller.tsx'
import pesosController from './actions/pesos/controller.tsx'
import { assets } from './assets.ts'
import { routes } from './routes.ts'

export const router = createRouter({
  middleware: [staticFiles('./public', { index: false }), formData(), render({ assets })],
})

export type AppContext = RouterContext<typeof router>

declare module 'remix' {
  interface RouterTypes {
    context: AppContext
  }
}

router.map(routes, controller)
router.map(routes.organizaciones, organizacionesController)
router.map(routes.pesos, pesosController)
