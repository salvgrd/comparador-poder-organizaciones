import { createController } from 'remix/router'
import { redirect } from 'remix/response/redirect'

import { pesosCookie, pesosDesdeFormulario } from '../../data/pesos.ts'
import { PESOS_POR_DEFECTO } from '../../lib/codebook.ts'
import { routes } from '../../routes.ts'

export default createController(routes.pesos, {
  actions: {
    index() {
      return redirect(routes.metodo.href(), 303)
    },
    async action(context) {
      let reset = context.formData.get('reset') != null
      let pesos = reset ? PESOS_POR_DEFECTO : pesosDesdeFormulario(context.formData)
      let response = redirect(`${routes.metodo.href()}?guardado=${reset ? 'reset' : '1'}#pesos`, 303)
      response.headers.append('Set-Cookie', await pesosCookie.serialize(JSON.stringify(pesos)))
      return response
    },
  },
})
