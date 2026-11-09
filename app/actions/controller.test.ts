import * as assert from 'remix/assert'
import { describe, it } from 'remix/test'

import { getOrgs } from '../data/orgs.ts'
import { PESOS_POR_DEFECTO } from '../lib/codebook.ts'
import { calcularIndices } from '../lib/metrics.ts'
import { analizar, parseUnidades, UNIDADES_EJEMPLO } from '../lib/voting.ts'
import { router } from '../router.ts'
import { routes } from '../routes.ts'

const get = (path: string, init?: RequestInit) => router.fetch(new Request(new URL(path, 'http://localhost'), init))

describe('páginas', () => {
  for (let [nombre, path] of [
    ['panorama', routes.home.href()],
    ['comparar', `${routes.comparar.href()}?ids=cnt,inqmad`],
    ['calculadora', routes.calculadora.href()],
    ['método', routes.metodo.href()],
    ['ficha', routes.organizaciones.show.href({ id: 'inqmad' })],
  ]) {
    it(`GET ${nombre} devuelve HTML`, async () => {
      let res = await get(path)
      assert.equal(res.status, 200)
      assert.match(await res.text(), /Cartografía del/)
    })
  }

  it('la ficha del Sindicato de Inquilinas muestra las plenarias bimestrales', async () => {
    let html = await (await get(routes.organizaciones.show.href({ id: 'inqmad' }))).text()
    assert.match(html, /Plenarias/)
    assert.match(html, /Asamblea anual de afiliadas/)
    assert.match(html, /Grupo de Coordinación/)
  })

  it('la ficha tiene hexágono y tabla de características', async () => {
    let html = await (await get(routes.organizaciones.show.href({ id: 'cnt' }))).text()
    assert.match(html, /Hexágono de características/)
    assert.match(html, /<polygon/)
    assert.match(html, /Mandato imperativo/)
    assert.match(html, /Art\. 55/)
  })

  it('una organización inexistente da 404', async () => {
    let res = await get(routes.organizaciones.show.href({ id: 'no-existe' }))
    assert.equal(res.status, 404)
  })
})

describe('pesos', () => {
  it('guardar pesos fija la cookie y cambia los índices', async () => {
    let form = new FormData()
    form.set('mandato', '3')
    let res = await get(routes.pesos.action.href(), { method: 'POST', body: form })
    assert.equal(res.status, 303)
    let cookie = res.headers.get('Set-Cookie')?.split(';')[0] ?? ''
    assert.match(cookie, /^pesos=/)

    let conPesos = await (await get(routes.apiOrgs.href(), { headers: { Cookie: cookie } })).json()
    let sinPesos = await (await get(routes.apiOrgs.href())).json()
    let cnt = (d: any) => d.orgs.find((o: any) => o.id === 'cnt').indices.control_base
    assert.notEqual(cnt(conPesos), cnt(sinPesos))
  })
})

describe('datos', () => {
  it('todas las organizaciones son válidas y tienen cima alcanzable', async () => {
    for (let o of await getOrgs()) {
      assert.ok(calcularIndices(o, PESOS_POR_DEFECTO).hops != null, `${o.id}: la cima no es alcanzable desde la base`)
    }
  })

  it('saltos del organigrama', async () => {
    let orgs = await getOrgs()
    let hops = (id: string) => calcularIndices(orgs.find((o) => o.id === id)!, PESOS_POR_DEFECTO).hops
    assert.equal(hops('iww'), 1)
    assert.equal(hops('cgt'), 3)
    assert.equal(hops('cnt'), 4)
    assert.equal(hops('inqmad'), 2)
  })
})

describe('calculadora', () => {
  it('con la tabla de la CNT, una minoría de la afiliación gana', () => {
    let r = analizar(parseUnidades(UNIDADES_EJEMPLO), 'cnt_sind', 0.5)
    assert.equal(r.total, 97)
    assert.equal(r.q, 49)
    assert.ok(Math.abs(r.mwc - 0.1934) < 0.001)
  })

  it('con voto proporcional, la minoría ganadora supera el 50%', () => {
    let r = analizar(parseUnidades(UNIDADES_EJEMPLO), 'prop', 0.5)
    assert.ok(r.mwc > 0.5)
  })
})
