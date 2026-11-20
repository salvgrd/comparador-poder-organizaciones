import { form, get, route } from 'remix/routes'

export const routes = route({
  assets: get('/assets/*path'),
  home: get('/'),
  comparar: get('/comparar'),
  calculadora: get('/calculadora'),
  metodo: get('/metodo'),
  pesos: form('/metodo/pesos'),
  revision: get('/revision'),
  organizaciones: {
    show: get('/organizaciones/:id'),
    revision: get('/organizaciones/:id/revision'),
  },
  apiOrgs: get('/api/orgs.json'),
})
