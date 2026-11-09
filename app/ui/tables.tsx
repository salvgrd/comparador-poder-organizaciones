import type { Handle } from 'remix/component'

import { FAMILIAS, VARS } from '../lib/codebook.ts'
import { fmt, fmtN, pearson, type OrgConIndices } from '../lib/metrics.ts'
import { routes } from '../routes.ts'

export type ClaveOrden = 'nombre' | 'cb' | 'ag' | 'es' | 'olig' | 'hops' | 'brecha' | 'tam' | 'conf'

const COLS: { k: ClaveOrden; l: string; bar?: string }[] = [
  { k: 'nombre', l: 'Organización' },
  { k: 'cb', l: 'Control de base', bar: 'var(--s1)' },
  { k: 'ag', l: 'Agilidad', bar: 'var(--s2)' },
  { k: 'es', l: 'Escalabilidad', bar: 'var(--s3)' },
  { k: 'olig', l: 'Riesgo oligárquico', bar: 'var(--accent)' },
  { k: 'hops', l: 'Saltos' },
  { k: 'brecha', l: 'Brecha' },
  { k: 'tam', l: 'Escala' },
  { k: 'conf', l: 'Confianza' },
]

export const CLAVES_ORDEN = COLS.map((c) => c.k)

function valorOrden(o: OrgConIndices, k: ClaveOrden): number | string | null {
  switch (k) {
    case 'nombre':
      return o.siglas.toLowerCase()
    case 'tam':
      return o.tamano?.[0] ?? 0
    case 'conf':
      return { alta: 3, media: 2, baja: 1 }[o.confianza] ?? 0
    case 'brecha':
      return o.indices.brecha
    default:
      return o.indices[k]
  }
}

export function ordenar(orgs: OrgConIndices[], k: ClaveOrden, dir: 1 | -1) {
  return [...orgs].sort((a, b) => {
    let x = valorOrden(a, k)
    let y = valorOrden(b, k)
    if (x == null) return 1
    if (y == null) return -1
    return (x > y ? 1 : x < y ? -1 : 0) * dir
  })
}

export function OrgLink(handle: Handle<{ o: OrgConIndices; dot?: boolean }>) {
  return () => {
    let { o, dot } = handle.props
    return (
      <a class="orgname" href={routes.organizaciones.show.href({ id: o.id })}>
        {dot ? <i class={`fam ${o.familia}`} style={{ background: FAMILIAS[o.familia]?.color }}></i> : null}
        {o.siglas}
      </a>
    )
  }
}

export function IndexTable(handle: Handle<{ orgs: OrgConIndices[]; orden: ClaveOrden; dir: 1 | -1 }>) {
  return () => {
    let { orgs, orden, dir } = handle.props
    let filas = ordenar(orgs, orden, dir)
    let href = (k: ClaveOrden) => {
      let nd = orden === k ? -dir : k === 'nombre' ? 1 : -1
      return `${routes.home.href()}?orden=${k}&dir=${nd > 0 ? 'asc' : 'desc'}#indices`
    }
    return (
      <table id="indices">
        <thead>
          <tr>
            {COLS.map((c) => (
              <th aria-sort={orden === c.k ? (dir > 0 ? 'ascending' : 'descending') : undefined}>
                <a href={href(c.k)}>
                  {c.l}
                  {orden === c.k ? (dir > 0 ? ' ↑' : ' ↓') : ''}
                </a>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map((o) => (
            <tr>
              <td>
                <OrgLink o={o} dot />
                <div class="sub">{o.nombre}</div>
              </td>
              {COLS.slice(1).map((c) => {
                if (c.bar) {
                  let x = o.indices[c.k as 'cb' | 'ag' | 'es' | 'olig']
                  return (
                    <td>
                      <div class="bar">
                        <b>{fmt(x)}</b>
                        <i style={{ width: `${x == null ? 0 : Math.max(2, x * 0.9)}px`, background: c.bar }}></i>
                      </div>
                    </td>
                  )
                }
                if (c.k === 'hops') return <td class="num">{o.indices.hops ?? '—'}</td>
                if (c.k === 'brecha') return <td class="num">{o.indices.brecha}/4</td>
                if (c.k === 'tam') return <td class="num">{fmtN(o.tamano?.[0])}</td>
                return (
                  <td>
                    <span class={`pill ${o.confianza}`}>{o.confianza}</span>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    )
  }
}

export function justificacion(o: OrgConIndices, k: string): string {
  let c = (key: string) => o.codigos[key]
  if (k === 'proximidad') return `${o.indices.hops} saltos hasta la cima, según el organigrama.`
  if (k === 'freq_intermedio') return `${c('freq_intermedio_meses')?.[0]} meses. ${c('freq_intermedio_meses')?.[1] ?? ''}`
  if (k === 'niveles_s') return `${c('niveles')?.[0]} niveles. ${c('niveles')?.[1] ?? ''}`
  if (k === 'tamano_s') return o.tamano?.[1] ?? ''
  let cod = c(k)
  return cod ? `${cod[1]} (confianza ${cod[2]})` : ''
}

export function Heatmap(handle: Handle<{ orgs: OrgConIndices[] }>) {
  return () => (
    <table class="heat">
      <thead>
        <tr>
          <th>Organización</th>
          {VARS.map((v) => (
            <th class="v" title={v.l}>
              {v.l}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {handle.props.orgs.map((o) => (
          <tr>
            <td style={{ whiteSpace: 'nowrap' }}>
              <OrgLink o={o} />
            </td>
            {VARS.map((v) => {
              let val = o.indices.val(v.k)
              if (val == null) {
                return (
                  <td class="cell">
                    <span style={{ color: 'var(--muted)' }}>·</span>
                  </td>
                )
              }
              let q = Math.round(v.neg ? 4 - val : val)
              let baja = !v.calc && o.codigos[v.k]?.[2] === 'baja'
              let shown = Number.isInteger(val) ? String(val) : val.toFixed(1)
              let anchor = v.a[Math.round(val)]
              return (
                <td class={baja ? 'cell low' : 'cell'} title={`${o.siglas} · ${v.l}: ${shown}/4${anchor ? ` — ${anchor}` : ''}\n${justificacion(o, v.k)}`}>
                  <span style={{ background: `var(--q${q})`, color: `var(--qt${q})` }}>{shown}</span>
                </td>
              )
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export function Insights(handle: Handle<{ orgs: OrgConIndices[] }>) {
  return () => {
    let orgs = handle.props.orgs
    if (orgs.length < 2) return <p class="notice">Hacen falta al menos dos organizaciones para comparar.</p>
    let by = (k: 'cb' | 'ag' | 'es' | 'olig' | 'hops', dir: 1 | -1) =>
      orgs.filter((o) => o.indices[k] != null).sort((a, b) => (a.indices[k]! - b.indices[k]!) * dir)
    let ambos = orgs.filter((o) => o.indices.cb != null && o.indices.ag != null)
    let r = pearson(ambos.map((o) => o.indices.cb!), ambos.map((o) => o.indices.ag!))
    let top = by('cb', -1)[0]
    let low = by('cb', 1)[0]
    let ag = by('ag', -1)[0]
    let es = by('es', -1)[0]
    let ol = by('olig', -1)[0]
    let hm = by('hops', -1)[0]
    let eq = [...ambos].sort((a, b) => b.indices.cb! + b.indices.ag! - (a.indices.cb! + a.indices.ag!))[0]
    return (
      <div class="prose" style={{ fontSize: '.9rem' }}>
        <p>
          <b>Correlación control de base–agilidad: r = {r.toFixed(2)}.</b>{' '}
          {r < -0.3
            ? 'En esta muestra, más control desde abajo va con menos agilidad: el dilema existe en los datos.'
            : 'La relación es débil en esta muestra: el diseño concreto importa más que el modelo.'}
        </p>
        <p>
          <b>Más control de base:</b> {top.siglas} ({fmt(top.indices.cb)}). <b>Menos:</b> {low.siglas} ({fmt(low.indices.cb)}).
        </p>
        <p>
          <b>Más ágil:</b> {ag.siglas} ({fmt(ag.indices.ag)}). <b>Más escalable:</b> {es.siglas} ({fmt(es.indices.es)}).
        </p>
        <p>
          <b>Mejor equilibrio entre control y agilidad:</b> {eq.siglas}.
        </p>
        <p>
          <b>Mayor riesgo oligárquico:</b> {ol.siglas} ({fmt(ol.indices.olig)}). <b>Cadena de delegación más larga:</b>{' '}
          {hm.siglas}, con {hm.indices.hops} saltos.
        </p>
      </div>
    )
  }
}
