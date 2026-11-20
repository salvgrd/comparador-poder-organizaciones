import type { Handle } from 'remix/component'

import { FAMILIAS, UNIDADES_TAMANO, VARS, coberturaFuentes, conFuentes, etiquetaEstado } from '../lib/codebook.ts'
import { bandaTexto, fmt, fmtIC, fmtN, fmtPuesto, pearson, pearsonIC, type OrgConIndices } from '../lib/metrics.ts'
import { routes } from '../routes.ts'

export type ClaveOrden = 'nombre' | 'cb' | 'puesto' | 'ag' | 'ce' | 'es' | 'olig' | 'hops' | 'brecha' | 'tam' | 'conf' | 'fuentes'

const COLS: { k: ClaveOrden; l: string; bar?: boolean }[] = [
  { k: 'nombre', l: 'Organización' },
  { k: 'cb', l: 'Control de base', bar: true },
  { k: 'puesto', l: 'Puesto' },
  { k: 'ag', l: 'Agilidad', bar: true },
  { k: 'es', l: 'Escalabilidad', bar: true },
  { k: 'olig', l: 'Riesgo oligárquico', bar: true },
  { k: 'hops', l: 'Saltos' },
  { k: 'brecha', l: 'Brecha' },
  { k: 'tam', l: 'Escala' },
  { k: 'conf', l: 'Confianza' },
  { k: 'fuentes', l: 'Con fuente' },
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
    case 'fuentes':
      return coberturaFuentes(o).ratio
    case 'brecha':
      return o.indices.brecha
    case 'puesto':
      return o.indices.puestoCb == null ? null : -o.indices.puestoCb
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

/** Tramo de un índice 0-100 (intervalo del 90 %); el valor central y la banda, al pasar el cursor. */
export function Tramo(handle: Handle<{ x: number | null; ic: [number, number] | null }>) {
  return () => {
    let { x, ic } = handle.props
    if (x == null) return <span class="sub">—</span>
    return (
      <span class="mono" title={`Valor central ${fmt(x)} · banda ${bandaTexto(x, ic)}`}>
        {ic ? fmtIC(ic) : fmt(x)}
      </span>
    )
  }
}

/** `extra`: parámetros de la URL que se conservan al reordenar (los filtros del panorama). */
export function IndexTable(handle: Handle<{ orgs: OrgConIndices[]; orden: ClaveOrden; dir: 1 | -1; extra?: string }>) {
  return () => {
    let { orgs, orden, dir, extra } = handle.props
    let filas = ordenar(orgs, orden, dir)
    let href = (k: ClaveOrden) => {
      let nd = orden === k ? -dir : k === 'nombre' ? 1 : -1
      return `${routes.home.href()}?${extra ? `${extra}&` : ''}orden=${k}&dir=${nd > 0 ? 'asc' : 'desc'}#indices`
    }
    return (
      <table id="indices" class="idx-table">
        <thead>
          <tr>
            {COLS.map((c) => (
              <th class={c.k === 'nombre' ? undefined : 'c'} aria-sort={orden === c.k ? (dir > 0 ? 'ascending' : 'descending') : undefined}>
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
              <td class="org">
                <OrgLink o={o} dot />
                {etiquetaEstado(o) ? <span class="tag estado">{etiquetaEstado(o)}</span> : null}
                <div class="sub">{o.nombre}</div>
              </td>
              {COLS.slice(1).map((c) => {
                if (c.bar) {
                  let k = c.k as 'cb' | 'ag' | 'es' | 'olig'
                  let x = o.indices[k]
                  let ic = o.indices.ic[k]
                  return (
                    <td class="c">
                      <Tramo x={x} ic={ic} />
                    </td>
                  )
                }
                if (c.k === 'puesto') {
                  return (
                    <td class="c" title={`Puesto en control de base: ${fmtPuesto(o.indices.puestoCb, o.indices.puestoCbIc)} (intervalo del 90 %)`}>
                      {o.indices.puestoCb == null
                        ? '—'
                        : o.indices.puestoCbIc && o.indices.puestoCbIc[0] !== o.indices.puestoCbIc[1]
                          ? `${o.indices.puestoCbIc[0]}–${o.indices.puestoCbIc[1]}`
                          : String(o.indices.puestoCb)}
                    </td>
                  )
                }
                if (c.k === 'hops') return <td class="c">{o.indices.hops ?? '—'}</td>
                if (c.k === 'brecha') return <td class="c">{o.indices.brecha == null ? '—' : `${o.indices.brecha}/4`}</td>
                if (c.k === 'tam') {
                  let u = UNIDADES_TAMANO[o.tamano_unidad ?? 'afiliacion']
                  return (
                    <td class="c" title={`${u.l}. ${o.tamano?.[1] ?? ''}`}>
                      {fmtN(o.tamano?.[0])}
                      <div class="sub">{u.corto}</div>
                    </td>
                  )
                }
                if (c.k === 'fuentes') {
                  let f = coberturaFuentes(o)
                  return (
                    <td class="c" title={`${f.con} de ${f.total} códigos con fuente verificable`}>
                      <span class={conFuentes(o) ? undefined : 'muted'}>
                        {f.con}/{f.total}
                      </span>
                    </td>
                  )
                }
                return (
                  <td class="c">
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
  if (k === 'proximidad') {
    return `${o.indices.hops} ${o.indices.hops === 1 ? 'salto' : 'saltos'} hasta la cima según el organigrama, con mandato ${c('mandato')?.[0] ?? '—'}/4 y revocabilidad ${c('revocabilidad')?.[0] ?? '—'}/4: 4 · ((mandato + revocabilidad)/8)^saltos.`
  }
  if (k === 'freq_intermedio') return `${c('freq_intermedio_meses')?.[0]} meses. ${c('freq_intermedio_meses')?.[1] ?? ''}`
  if (k === 'freq_soberano') return c('freq_soberano_meses') ? `${c('freq_soberano_meses')![0]} meses. ${c('freq_soberano_meses')![1] ?? ''}` : ''
  if (k === 'niveles_s') {
    let h = o.indices.hops
    return h == null ? '' : `${h} ${h === 1 ? 'salto' : 'saltos'} desde la afiliación hasta la cima, según el organigrama.`
  }
  if (k === 'tamano_s') {
    let u = UNIDADES_TAMANO[o.tamano_unidad ?? 'afiliacion']
    return `${o.tamano?.[1] ?? ''}${u.comparable ? '' : ` Cuenta ${u.l}, no membresía: no se puntúa.`}`
  }
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
            <th class="v" title={v.alto ? `${v.l} (${v.alto})` : v.l}>
              {v.l}
              {v.alto ? ' ⇅' : ''}
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
              let q = Math.round(v.alto ? 4 - val : val)
              let baja = o.indices.conf(v.k) === 'baja'
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
    let by = (k: 'cb' | 'ag' | 'agb' | 'es' | 'olig' | 'hops', dir: 1 | -1) =>
      orgs.filter((o) => o.indices[k] != null).sort((a, b) => (a.indices[k]! - b.indices[k]!) * dir)
    let ambos = orgs.filter((o) => o.indices.cb != null && o.indices.ag != null)
    let r = pearson(ambos.map((o) => o.indices.cb!), ambos.map((o) => o.indices.ag!))
    let ric = pearsonIC(r, ambos.length)
    let primeros = orgs.filter((o) => o.indices.puestoCbIc?.[0] === 1)
    let low = by('cb', 1)[0]
    let ag = by('ag', -1)[0]
    let agb = by('agb', -1)[0]
    let es = by('es', -1)[0]
    let ol = by('olig', -1)[0]
    let hm = by('hops', -1)[0]
    let b = (o: OrgConIndices, k: 'cb' | 'ag' | 'agb' | 'es' | 'olig') => bandaTexto(o.indices[k], o.indices.ic[k])
    return (
      <div class="prose" style={{ fontSize: '.9rem' }}>
        <p>
          <b>
            Control de base y agilidad: r = {Number.isFinite(r) ? r.toFixed(2) : '—'}
            {ric ? ` (intervalo del 95 %: ${ric[0].toFixed(2)} a ${ric[1].toFixed(2)}; n = ${ambos.length})` : ''}.
          </b>{' '}
          {!ric
            ? 'No hay datos suficientes para estimar la relación.'
            : ric[0] < 0 && ric[1] > 0
              ? 'Con estos datos no se puede afirmar que más control desde abajo vaya con menos agilidad, ni con más: el intervalo incluye el cero.'
              : r < 0
                ? 'En esta muestra, más control de base va con menos agilidad. Es lo esperable, porque la vía dirección de la agilidad es justo lo contrario del control de base; mira abajo quién es ágil por la vía base.'
                : 'En esta muestra, más control de base va con más agilidad.'}
        </p>
        {primeros.length > 1 ? (
          <p>
            <b>Pueden ser las de más control de base:</b> {primeros.map((o) => o.siglas).join(', ')}. Sus tramos de
            puesto incluyen el primero, así que no tiene sentido ordenarlas entre sí.
          </p>
        ) : primeros.length === 1 ? (
          <p>
            <b>Más control de base:</b> {primeros[0].siglas} (puesto{' '}
            {fmtPuesto(primeros[0].indices.puestoCb, primeros[0].indices.puestoCbIc)}, banda{' '}
            {bandaTexto(primeros[0].indices.cb, primeros[0].indices.ic.cb)}).
          </p>
        ) : null}
        <p>
          <b>Menos control de base:</b> {low.siglas} (banda {b(low, 'cb')}). <b>Más ágil:</b> {ag.siglas} (banda {b(ag, 'ag')}). <b>Más ágil vía base</b>{' '}
          (sin depender de la dirección): {agb.siglas} (banda {b(agb, 'agb')}). <b>Estructura más escalable:</b> {es.siglas} (banda {b(es, 'es')}).
        </p>
        <p>
          <b>Mayor riesgo oligárquico:</b> {ol ? `${ol.siglas} (banda ${b(ol, 'olig')})` : '—'}. <b>Cadena de delegación más
          larga:</b> {hm.siglas}, con {hm.indices.hops} saltos.
        </p>
      </div>
    )
  }
}
