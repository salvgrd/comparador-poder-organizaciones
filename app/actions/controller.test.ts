import * as assert from 'remix/assert'
import { describe, it } from 'remix/test'

import { getOrgs, validarOrg } from '../data/orgs.ts'
import { PESOS_POR_DEFECTO, SIN_FUENTE, coberturaFuentes } from '../lib/codebook.ts'
import { calcularIndices, conIndices, freqScore, proximidadScore } from '../lib/metrics.ts'
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

describe('índices', () => {
  it('quincenal no es semanal', () => {
    assert.equal(freqScore(0.25), 4)
    assert.equal(freqScore(0.5), 3)
    assert.equal(freqScore(48), 0)
  })

  it('la proximidad exige mandato: un plebiscito a un salto puntúa menos que una cadena mandatada', () => {
    assert.equal(proximidadScore(4, 4, 4), 4)
    assert.equal(proximidadScore(1, 0, 0), 0)
    assert.ok(proximidadScore(1, 0, 2)! < proximidadScore(4, 4, 4)!)
    assert.equal(proximidadScore(null, 4, 4), null)
  })

  it('sin brecha no hay control de base ajustado', async () => {
    let o = structuredClone((await getOrgs()).find((x) => x.id === 'cnt')!)
    delete o.codigos.brecha_formal_real
    let i = calcularIndices(o, PESOS_POR_DEFECTO)
    assert.equal(i.cb, null)
    assert.ok(i.cbBruto != null)
  })

  it('el tamaño que no es membresía no se puntúa', async () => {
    let rojava = (await getOrgs()).find((x) => x.id === 'rojava')!
    assert.equal(calcularIndices(rojava, PESOS_POR_DEFECTO).tamanoS, null)
  })

  it('una ficha con dos cimas no es válida', async () => {
    let o = structuredClone((await getOrgs()).find((x) => x.id === 'cnt')!)
    o.organos.forEach((n) => (n.cima = true))
    assert.ok(validarOrg(o).some((e) => /exactamente un órgano/.test(e)))
  })

  it('un caso fracasado necesita tipo, causa y momento codificado', async () => {
    let o = structuredClone((await getOrgs()).find((x) => x.id === 'cnt')!)
    o.estado = { situacion: 'disuelta', tipos: [], causa: '', momento_codificado: '' }
    assert.equal(validarOrg(o).filter((e) => /estado/.test(e)).length, 3)
    o.estado = { situacion: 'disuelta', tipos: ['escision'], desde: 2000, causa: 'x', momento_codificado: 'y' }
    assert.deepEqual(validarOrg(o), [])
  })

  it('la cobertura de fuentes no cuenta los códigos sin fuente ni los ausentes', async () => {
    let o = structuredClone((await getOrgs()).find((x) => x.id === 'cnt')!)
    let antes = coberturaFuentes(o)
    o.codigos.mandato = [4, `${SIN_FUENTE}: estimación.`, 'baja']
    delete o.codigos.pluralismo
    let despues = coberturaFuentes(o)
    assert.equal(despues.total, antes.total)
    assert.equal(despues.con, antes.con - 2)
  })

  it('los intervalos contienen el valor y son reproducibles', async () => {
    let orgs = await getOrgs()
    let a = conIndices(orgs, PESOS_POR_DEFECTO, 100)
    let b = conIndices(orgs, PESOS_POR_DEFECTO, 100)
    for (let [i, o] of a.entries()) {
      let { cb, ic } = o.indices
      if (cb == null) continue
      assert.ok(ic.cb![0] <= cb + 1e-9 && cb <= ic.cb![1] + 1e-9, `${o.id}: ${cb} fuera de ${ic.cb}`)
      assert.deepEqual(ic.cb, b[i].indices.ic.cb)
    }
  })

  it('el PSOE ya no puntúa como máxima proximidad', async () => {
    let psoe = (await getOrgs()).find((x) => x.id === 'psoe')!
    assert.ok(calcularIndices(psoe, PESOS_POR_DEFECTO).val('proximidad')! < 2)
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
