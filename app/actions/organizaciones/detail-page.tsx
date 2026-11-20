import type { Handle } from 'remix/component'

import { CE_KEYS, FAMILIAS, HEXAGONO, TIPOS_FRACASO, TIPO_PROBLEMA, UNIDADES_TAMANO, VARS, coberturaFuentes, esFracaso, etiquetaEstado } from '../../lib/codebook.ts'
import { fmtN, fmtPuesto, type OrgConIndices } from '../../lib/metrics.ts'
import { routes } from '../../routes.ts'
import { Hexagon, OrgChart, type CaraHexagono } from '../../ui/charts.tsx'
import { REGLAS } from '../../ui/org-card.tsx'
import { justificacion } from '../../ui/tables.tsx'
import { Document } from '../document.tsx'

const media = (xs: (number | null)[]) => {
  let f = xs.filter((x): x is number => x != null)
  return f.length ? f.reduce((a, b) => a + b, 0) / f.length : null
}

export function carasHexagono(o: OrgConIndices, todas: OrgConIndices[]): CaraHexagono[] {
  let cara = (x: OrgConIndices, vars: string[]) => media(vars.map((k) => x.indices.val(k)))
  return HEXAGONO.map((d) => ({
    l: d.l,
    v: cara(o, d.vars),
    ref: media(todas.filter((x) => x.id !== o.id).map((x) => cara(x, d.vars))),
  }))
}

/** Descripción del valor; los intermedios sin anclaje propio se describen por sus vecinos. */
function anclaje(a: string[], val: number): string {
  let i = Math.round(val)
  if (a[i]) return a[i]
  let antes = a[i - 1]
  let despues = a[i + 1]
  return antes && despues ? `Entre «${antes}» y «${despues}»` : '—'
}

/** Grupos de filas de la tabla: las seis caras del hexágono, la centralización, la brecha y el tamaño. */
const GRUPOS = [
  ...HEXAGONO.map((d) => ({ l: d.l, vars: d.vars })),
  { l: 'Agilidad vía dirección (centralización)', vars: [...CE_KEYS] },
  { l: 'Ajuste: poder real frente a estatutos', vars: ['brecha_formal_real'] },
  { l: 'Contexto: tamaño (no puntúa en ningún índice salvo el riesgo oligárquico)', vars: ['tamano_s'] },
]

function Score(handle: Handle<{ v: number; neg?: boolean }>) {
  return () => {
    let { v, neg } = handle.props
    return (
      <span class={neg ? 'score neg' : 'score'}>
        <i>
          <b style={{ width: `${(v / 4) * 100}%` }}></b>
        </i>
        <span class="mono">{Number.isInteger(v) ? v : v.toFixed(1)}/4</span>
      </span>
    )
  }
}

export function DetailPage(handle: Handle<{ o: OrgConIndices; todas: OrgConIndices[] }>) {
  return () => {
    let { o, todas } = handle.props
    let i = o.indices

    return (
      <Document title={o.siglas}>
        <section class="view">
          <p class="crumbs">
            <a href={routes.home.href()}>← Panorama</a> ·{' '}
            <a href={`${routes.comparar.href()}?ids=${o.id}`}>Comparar con otras</a> ·{' '}
            <a href={routes.organizaciones.revision.href({ id: o.id })}>Ficha para revisar los datos</a>
          </p>

          <div class="detail-head">
            <div>
              <div class="eyebrow">
                {FAMILIAS[o.familia]?.label ?? o.familia} · {o.pais ?? ''} · {o.fundacion ?? ''} · {fmtN(o.tamano?.[0])}{' '}
                {UNIDADES_TAMANO[o.tamano_unidad ?? 'afiliacion'].l}
              </div>
              <h2>{o.siglas}</h2>
              <div class="sub">
                {o.nombre} <span class={`pill ${o.confianza}`}>confianza {o.confianza}</span>
                {etiquetaEstado(o) ? <span class="tag estado">{etiquetaEstado(o)}</span> : null}
                <span class="tag estado">
                  {coberturaFuentes(o).con}/{coberturaFuentes(o).total} códigos con fuente
                </span>
              </div>
            </div>
            <div class="idx" style={{ gridTemplateColumns: 'repeat(2, minmax(110px, 1fr))', marginTop: 0 }}>
              <div>
                <b>{fmtPuesto(i.puestoCb, i.puestoCbIc)}</b>
                <span>Puesto en control de base, de {todas.length}</span>
              </div>
              <div>
                <b>{i.hops ?? '—'}</b>
                <span>Saltos hasta la cima</span>
              </div>
            </div>
          </div>

          <div class="grid2">
            <div class="panel">
              <h3>Hexágono de características</h3>
              <Hexagon caras={carasHexagono(o, todas)} nombre={o.siglas} />
              <div class="hex-legend">
                <span><i></i>{o.siglas}</span>
                <span><i class="ref"></i>Media de las otras {todas.length - 1} organizaciones</span>
              </div>
              <p class="notice">
                Cada cara es la media 0-4 de sus variables (detalle en la tabla de abajo). Más hacia fuera es más
                control desde la base, más rapidez de los órganos colectivos o una estructura más replicable. La centralización
                ejecutiva no está en el hexágono porque «más» no es mejor ni peor: está en las estadísticas y en la
                tabla.
              </p>
            </div>
            <div class="panel">
              {o.resumen ? <p style={{ marginTop: 0 }}>{o.resumen}</p> : null}
              <dl class="power">
                <dt class="eyebrow">Poder formal</dt>
                <dd style={{ margin: '2px 0 8px' }}>{o.poder_formal}</dd>
                <dt class="eyebrow">Dónde reside el poder realmente</dt>
                <dd style={{ margin: '2px 0 0' }}>{o.poder_real}</dd>
              </dl>
              <h3 style={{ marginTop: '16px' }}>Problemas detectados</h3>
              <ul class="problems">
                {(o.problemas ?? []).map((p) => (
                  <li>
                    <span class={`tag ${p.t}`}>{TIPO_PROBLEMA[p.t] ?? p.t}</span>
                    <span>{p.x}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div class="panel">
            <h3>Características</h3>
            <div class="scroll-x">
              <table class="chars">
                <thead>
                  <tr>
                    <th>Característica</th>
                    <th>Valor</th>
                    <th>Qué significa ese valor</th>
                    <th>Justificación</th>
                    <th>Confianza</th>
                  </tr>
                </thead>
                <tbody>
                  {GRUPOS.map((g) => (
                    <>
                      <tr>
                        <th class="grp" colSpan={5}>{g.l}</th>
                      </tr>
                      {g.vars.map((k) => {
                        let v = VARS.find((x) => x.k === k)!
                        let val = i.val(k)
                        let cod = o.codigos[k]
                        return (
                          <tr>
                            <td>
                              <b>{v.l}</b>
                              {v.calc && !v.l.includes('calculada') ? <div class="sub">calculada</div> : null}
                              {v.alto ? <div class="sub">{v.alto}</div> : null}
                            </td>
                            <td>{val == null ? '—' : <Score v={val} neg={!!v.alto} />}</td>
                            <td>{val == null ? '' : anclaje(v.a, val)}</td>
                            <td class="just">{v.calc ? justificacion(o, k) : (cod?.[1] ?? '')}</td>
                            <td>
                              {i.conf(k) ? <span class={`pill ${i.conf(k)}`}>{i.conf(k)}</span> : <span class="sub">—</span>}
                            </td>
                          </tr>
                        )
                      })}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {esFracaso(o) ? (
            <div class="panel prose">
              <h3>Cómo acabó</h3>
              <p>
                {o.estado!.tipos.map((t) => (
                  <span class="tag estado">{TIPOS_FRACASO[t]}</span>
                ))}
              </p>
              <p>{o.estado!.causa}</p>
              <p class="notice">
                <b>Momento que describe esta ficha:</b> {o.estado!.momento_codificado}
              </p>
            </div>
          ) : null}

          <div class="panel">
            <h3>Crisis de crecimiento</h3>
            <p class="notice" style={{ margin: '0 0 8px' }}>
              Momentos en que la organización tuvo que reformarse porque su estructura dejó de funcionar al crecer. Es
              la medida directa de escalabilidad; todavía no puntúa porque faltan datos de casi todas.
            </p>
            {o.crisis_crecimiento?.length ? (
              <ul class="problems">
                {o.crisis_crecimiento.map((c) => (
                  <li>
                    <span class="tag escalabilidad">{c.anio}</span>
                    <span>
                      {c.tamano ? `Con unas ${fmtN(c.tamano)} ${UNIDADES_TAMANO[o.tamano_unidad ?? 'afiliacion'].l}: ` : ''}
                      {c.x}
                      {c.fuente ? <span class="sub"> ({c.fuente})</span> : null}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p class="sub">Sin datos. Se añaden en el campo «crisis_crecimiento» de la ficha.</p>
            )}
          </div>

          <div class="panel">
            <h3>Organigrama</h3>
            <p class="notice" style={{ margin: 0 }}>
              De abajo (afiliación) hacia arriba; cada flecha significa «elige a». En color, la cima ejecutiva. Pasa
              el cursor por un órgano para ver qué decide.
            </p>
            <div class="org-svg">
              <OrgChart org={o} hops={i.hopsPorOrgano} />
            </div>
            <details>
              <summary>Órganos en detalle ({o.organos.length})</summary>
              <dl class="kv">
                {o.organos
                  .filter((n) => n.tipo !== 'base' || n.desc)
                  .map((n) => (
                    <div>
                      <dt>
                        {n.tipo}
                        {n.cima ? ' · cima' : ''}
                      </dt>
                      <dd>
                        <b>{n.n}</b>
                        {n.decide ? <> — <i>{n.decide}</i></> : null}
                        {n.freq ? ` · ${n.freq}` : null}
                        {n.desc ? (
                          <>
                            <br />
                            <span class="sub">{n.desc}</span>
                          </>
                        ) : null}
                      </dd>
                    </div>
                  ))}
              </dl>
            </details>
          </div>

          <div class="grid2">
            <div class="panel">
              <h3>Reglas de decisión</h3>
              <dl class="kv">
                {REGLAS.filter(([k]) => o.reglas?.[k]).map(([k, l]) => (
                  <div>
                    <dt>{l}</dt>
                    <dd>{o.reglas![k]}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div class="panel">
              <h3>Fuentes</h3>
              <ul class="sources">
                {(o.fuentes ?? []).map((f) => (
                  <li>
                    <a href={f.u} target="_blank" rel="noopener">
                      {f.t}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </Document>
    )
  }
}
