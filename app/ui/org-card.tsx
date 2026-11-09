import type { Handle } from 'remix/component'

import { FAMILIAS, TIPO_PROBLEMA } from '../lib/codebook.ts'
import { fmt, type OrgConIndices } from '../lib/metrics.ts'
import { routes } from '../routes.ts'
import { OrgChart } from './charts.tsx'

export const REGLAS: [keyof NonNullable<OrgConIndices['reglas']>, string][] = [
  ['metodo', 'Método de decisión'],
  ['ponderacion', 'Ponderación'],
  ['mandato', 'Mandato'],
  ['cargos', 'Cargos'],
  ['reforma', 'Reforma'],
  ['minorias', 'Minorías'],
]

export function OrgCard(handle: Handle<{ o: OrgConIndices }>) {
  return () => {
    let { o } = handle.props
    let i = o.indices
    return (
      <article class="panel card">
        <div class="eyebrow">
          {FAMILIAS[o.familia]?.label ?? o.familia} · {o.pais ?? ''} · {o.fundacion ?? ''}
        </div>
        <h3>
          <a class="orgname" href={routes.organizaciones.show.href({ id: o.id })}>
            {o.siglas} →
          </a>
        </h3>
        <div class="sub">
          {o.nombre} <span class={`pill ${o.confianza}`}>confianza {o.confianza}</span>
        </div>
        <div class="idx">
          <div><b>{fmt(i.cb)}</b><span>Control de base</span></div>
          <div><b>{fmt(i.ag)}</b><span>Agilidad</span></div>
          <div><b>{fmt(i.es)}</b><span>Escala</span></div>
          <div><b>{i.hops ?? '—'}</b><span>Saltos</span></div>
        </div>
        {o.resumen ? <p style={{ margin: '12px 0 0' }}>{o.resumen}</p> : null}
        <dl class="power">
          <dt class="eyebrow">Poder formal</dt>
          <dd style={{ margin: '2px 0 8px' }}>{o.poder_formal}</dd>
          <dt class="eyebrow">Dónde reside el poder realmente</dt>
          <dd style={{ margin: '2px 0 0' }}>{o.poder_real}</dd>
        </dl>
        <h3 style={{ marginTop: '16px' }}>Organigrama</h3>
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
        <details open>
          <summary>Reglas de decisión</summary>
          <dl class="kv">
            {REGLAS.filter(([k]) => o.reglas?.[k]).map(([k, l]) => (
              <div>
                <dt>{l}</dt>
                <dd>{o.reglas![k]}</dd>
              </div>
            ))}
          </dl>
        </details>
        <details open>
          <summary>Problemas detectados</summary>
          <ul class="problems">
            {(o.problemas ?? []).map((p) => (
              <li>
                <span class={`tag ${p.t}`}>{TIPO_PROBLEMA[p.t] ?? p.t}</span>
                <span>{p.x}</span>
              </li>
            ))}
          </ul>
        </details>
        <details>
          <summary>Fuentes</summary>
          <ul class="sources">
            {(o.fuentes ?? []).map((f) => (
              <li>
                <a href={f.u} target="_blank" rel="noopener">
                  {f.t}
                </a>
              </li>
            ))}
          </ul>
        </details>
      </article>
    )
  }
}
