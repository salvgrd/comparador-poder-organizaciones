import type { Handle } from 'remix/component'

import { FAMILIAS, VARS } from '../lib/codebook.ts'
import { bandaTexto, fmt, fmtIC, fmtN, type OrgConIndices } from '../lib/metrics.ts'
import type { Org } from '../lib/types.ts'
import { routes } from '../routes.ts'

export function FamLegend() {
  return () => (
    <div class="legend">
      {Object.entries(FAMILIAS).map(([k, f]) => (
        <span>
          <i class={`fam ${k}`} style={{ background: f.color, transform: k === 'cooperativa' ? 'rotate(45deg) scale(.85)' : undefined, borderRadius: k === 'cooperativa' ? '1px' : undefined }}></i>
          {f.label}
        </span>
      ))}
      <span>
        <svg width="16" height="14" aria-hidden="true">
          <circle cx="8" cy="7" r="5" fill="none" stroke="var(--muted)" stroke-width="1.5" />
        </svg>
        tamaño no comparable (población, familias)
      </span>
    </div>
  )
}

/**
 * Dispersión control de base (x) frente a agilidad (y). El tamaño del punto es la membresía en escala
 * logarítmica; hueco si el tamaño no es de membresía. Los ejes se leen por bandas (bajo / medio / alto).
 */
export function Scatter(handle: Handle<{ orgs: OrgConIndices[] }>) {
  return () => {
    let W = 980
    let H = 520
    let m = { l: 72, r: 20, t: 18, b: 46 }
    let X = (x: number) => m.l + (x / 100) * (W - m.l - m.r)
    let Y = (y: number) => H - m.b - (y / 100) * (H - m.t - m.b)
    let cortes = [0, 100 / 3, 200 / 3, 100]
    let bandas = [
      { l: 'bajo', c: 100 / 6 },
      { l: 'medio', c: 50 },
      { l: 'alto', c: 500 / 6 },
    ]

    let pts = handle.props.orgs
      .filter((o) => o.indices.cb != null && o.indices.ag != null)
      .map((o) => ({ o, x: X(o.indices.cb!), y: Y(o.indices.ag!), r: 5 + 2.2 * (o.indices.tamanoS ?? 0), hueco: o.indices.tamanoS == null }))
      .sort((a, b) => b.r - a.r)

    let placed: { x: number; y: number }[] = []
    let marks = pts.map((p) => {
      let color = FAMILIAS[p.o.familia]?.color ?? FAMILIAS.sindicato.color
      let lx = p.x + p.r + 4
      let ly = p.y + 4
      let anchor = 'start'
      if (lx > W - 90) {
        lx = p.x - p.r - 4
        anchor = 'end'
      }
      for (let k = 0; k < 8; k++) {
        if (!placed.some((q) => Math.abs(q.y - ly) < 12 && Math.abs(q.x - lx) < 70)) break
        ly += (k % 2 ? -1 : 1) * 12 * (k + 1)
      }
      placed.push({ x: lx, y: ly })
      let i = p.o.indices
      let fill = p.hueco ? 'var(--surface)' : color
      return (
        <a href={routes.organizaciones.show.href({ id: p.o.id })}>
          <g>
            <title>
              {`${p.o.nombre}\nControl de base ${fmt(i.cb)} (${fmtIC(i.ic.cb)}), banda ${bandaTexto(i.cb, i.ic.cb)}\nAgilidad ${fmt(i.ag)} (${fmtIC(i.ic.ag)}), banda ${bandaTexto(i.ag, i.ic.ag)}\nTamaño ${fmtN(p.o.tamano?.[0])} · Saltos ${i.hops ?? '—'}`}
            </title>
            {p.o.familia === 'cooperativa' ? (
              <rect
                x={p.x - p.r * 0.8}
                y={p.y - p.r * 0.8}
                width={p.r * 1.6}
                height={p.r * 1.6}
                transform={`rotate(45 ${p.x} ${p.y})`}
                fill={fill}
                fill-opacity="0.85"
                stroke={p.hueco ? color : 'var(--surface)'}
                stroke-width="2"
              />
            ) : (
              <circle cx={p.x} cy={p.y} r={p.r} fill={fill} fill-opacity="0.85" stroke={p.hueco ? color : 'var(--surface)'} stroke-width="2" />
            )}
            <circle cx={p.x} cy={p.y} r={Math.max(p.r, 12)} fill="transparent" />
            <text x={lx} y={ly} text-anchor={anchor} class="scatter-label">
              {p.o.siglas}
            </text>
          </g>
        </a>
      )
    })

    return (
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ minWidth: '520px' }} role="img" aria-label="Control de base frente a agilidad">
        <g class="grid">
          {cortes.map((t) => (
            <>
              <line x1={X(t)} x2={X(t)} y1={Y(0)} y2={Y(100)} />
              <line x1={X(0)} x2={X(100)} y1={Y(t)} y2={Y(t)} />
            </>
          ))}
        </g>
        <g class="axis">
          {bandas.map((b) => (
            <>
              <text x={X(b.c)} y={H - m.b + 16} text-anchor="middle">{b.l}</text>
              <text x={m.l - 8} y={Y(b.c) + 4} text-anchor="end">{b.l}</text>
            </>
          ))}
          <text x={(X(0) + X(100)) / 2} y={H - 8} text-anchor="middle" class="axis-title">
            Control de base →
          </text>
          <text transform={`translate(14 ${(Y(0) + Y(100)) / 2}) rotate(-90)`} text-anchor="middle" class="axis-title">
            Agilidad →
          </text>
        </g>
        {marks}
      </svg>
    )
  }
}

const wrapText = (t: string, max: number) => {
  let lines: string[] = []
  let cur = ''
  for (let w of t.split(/\s+/)) {
    if ((cur + ' ' + w).trim().length > max) {
      if (cur) lines.push(cur)
      cur = w
    } else cur = (cur + ' ' + w).trim()
  }
  if (cur) lines.push(cur)
  return lines.slice(0, 3)
}

/** Organigrama en estratos: base abajo, cima arriba; cada flecha significa «elige a». */
export function OrgChart(handle: Handle<{ org: Org; hops: Record<string, number> }>) {
  return () => {
    let { org, hops } = handle.props
    let levels = [...new Set(org.organos.map((n) => n.nivel))].sort((a, b) => a - b)
    let byL = levels.map((l) => org.organos.filter((n) => n.nivel === l))
    let maxN = Math.max(...byL.map((a) => a.length))
    let bw = 150
    let bh = 62
    let gx = 14
    let gy = 34
    let W = Math.max(340, maxN * (bw + gx) + gx)
    let H = levels.length * (bh + gy) + gy
    let pos: Record<string, { x: number; y: number; nivel: number }> = {}
    byL.forEach((arr, li) => {
      let total = arr.length * bw + (arr.length - 1) * gx
      let x0 = (W - total) / 2
      let y = H - gy - (li + 1) * (bh + gy) + gy
      arr.forEach((n, i) => (pos[n.id] = { x: x0 + i * (bw + gx), y, nivel: n.nivel }))
    })
    let marker = `ar-${org.id}`

    let edges = org.organos.flatMap((n) =>
      (n.elegido_por ?? []).map((src) => {
        let a = pos[src]
        let b = pos[n.id]
        if (!a || !b) return null
        let d =
          a.nivel === b.nivel
            ? `M${a.x + bw} ${a.y + bh / 2} L${b.x} ${b.y + bh / 2}`
            : `M${a.x + bw / 2} ${a.y} C${a.x + bw / 2} ${(a.y + b.y + bh) / 2}, ${b.x + bw / 2} ${(a.y + b.y + bh) / 2}, ${b.x + bw / 2} ${b.y + bh + 2}`
        return <path d={d} fill="none" stroke="var(--muted)" stroke-opacity="0.55" stroke-width="1.3" marker-end={`url(#${marker})`} />
      }),
    )

    let nodes = org.organos.map((n) => {
      let p = pos[n.id]
      let top = n.cima
      let sov = n.tipo === 'soberano'
      let lines = wrapText(n.n, 22)
      let ty = p.y + bh / 2 - (lines.length - 1) * 6.5 + 8
      let tc = top ? 'var(--accent-ink)' : 'var(--ink)'
      let tip = [n.n, n.decide && `Decide: ${n.decide}`, n.freq && `Frecuencia: ${n.freq}`, n.desc, hops[n.id] != null && `${hops[n.id]} saltos desde la base`]
        .filter(Boolean)
        .join('\n')
      return (
        <g>
          <title>{tip}</title>
          <rect
            x={p.x}
            y={p.y}
            width={bw}
            height={bh}
            rx="4"
            fill={top ? 'var(--accent)' : n.tipo === 'base' ? 'var(--soft)' : 'var(--surface)'}
            stroke={top ? 'var(--accent)' : sov ? 'var(--ink)' : 'var(--line)'}
            stroke-width={sov || top ? 2 : 1}
            stroke-dasharray={n.tipo === 'militar' ? '5 3' : undefined}
          />
          {lines.map((ln, i) => (
            <text x={p.x + bw / 2} y={ty + i * 13} text-anchor="middle" class="node-label" style={{ fill: tc, fontWeight: top || sov ? 600 : 400 }}>
              {ln}
            </text>
          ))}
          <text x={p.x + 6} y={p.y + 10} class="node-type" style={{ fill: top ? 'var(--accent-ink)' : 'var(--muted)' }}>
            {n.tipo.toUpperCase()}
          </text>
        </g>
      )
    })

    return (
      <svg viewBox={`0 0 ${W} ${H}`} width={W} style={{ maxWidth: 'none', display: 'block', margin: '0 auto' }} role="img" aria-label={`Organigrama de ${org.siglas}`}>
        <defs>
          <marker id={marker} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0 0L10 5L0 10z" fill="var(--muted)" />
          </marker>
        </defs>
        {edges}
        {nodes}
      </svg>
    )
  }
}

const SLOT = ['var(--s1)', 'var(--s2)', 'var(--s3)']

export function Mark(handle: Handle<{ i: number; size?: number }>) {
  return () => {
    let { i, size = 16 } = handle.props
    let c = size / 2
    let r = size * 0.34
    let col = SLOT[i]
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        {i === 1 ? (
          <rect x={c - r} y={c - r} width={2 * r} height={2 * r} rx="1.5" fill={col} stroke="var(--surface)" stroke-width="2" />
        ) : i === 2 ? (
          <path d={`M${c} ${c - r * 1.2} L${c + r * 1.1} ${c + r * 0.9} L${c - r * 1.1} ${c + r * 0.9}Z`} fill={col} stroke="var(--surface)" stroke-width="2" />
        ) : (
          <circle cx={c} cy={c} r={r} fill={col} stroke="var(--surface)" stroke-width="2" />
        )}
      </svg>
    )
  }
}

/** Gráfico de puntos variable a variable para hasta tres organizaciones. */
export function DotPlot(handle: Handle<{ orgs: OrgConIndices[] }>) {
  return () => {
    let sel = handle.props.orgs
    type Fila = {
      l: string
      max: number
      get: (o: OrgConIndices) => number | null
      ic?: (o: OrgConIndices) => [number, number] | null
      alto?: string
      just?: (o: OrgConIndices) => string
    }
    let filas: Fila[] = [
      { l: 'Control de base (0-100)', max: 100, get: (o) => o.indices.cb, ic: (o) => o.indices.ic.cb },
      { l: 'Agilidad (0-100)', max: 100, get: (o) => o.indices.ag, ic: (o) => o.indices.ic.ag },
      { l: 'Agilidad vía base (0-100)', max: 100, get: (o) => o.indices.agb, ic: (o) => o.indices.ic.agb },
      { l: 'Agilidad vía dirección (0-100)', max: 100, get: (o) => o.indices.ce, ic: (o) => o.indices.ic.ce },
      { l: 'Escalabilidad (0-100)', max: 100, get: (o) => o.indices.es, ic: (o) => o.indices.ic.es },
      { l: 'Riesgo oligárquico (0-100)', max: 100, get: (o) => o.indices.olig, ic: (o) => o.indices.ic.olig, alto: 'alto = peor' },
      ...VARS.map((v) => ({
        l: v.l,
        max: 4,
        alto: v.alto,
        get: (o: OrgConIndices) => o.indices.val(v.k),
        just: (o: OrgConIndices) => o.codigos[v.k]?.[1] ?? '',
      })),
    ]
    let pad = 10
    let w = 300

    return (
      <>
        <div class="legend">
          {sel.map((o, i) => (
            <span>
              <Mark i={i} size={14} /> {o.siglas}
            </span>
          ))}
        </div>
        <div>
          {filas.map((f) => (
            <div class="dot-row">
              <span>
                {f.l}
                {f.alto ? <span class="sub"> ({f.alto})</span> : null}
              </span>
              <div style={{ position: 'relative', height: '22px' }}>
                <svg viewBox={`0 0 ${w} 22`} width="100%" height="22" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                  <line x1={pad} x2={w - pad} y1="11" y2="11" stroke="var(--line)" stroke-width="2" />
                  {[0, 0.25, 0.5, 0.75, 1].map((t) => (
                    <line x1={pad + t * (w - 2 * pad)} x2={pad + t * (w - 2 * pad)} y1="7" y2="15" stroke="var(--line)" />
                  ))}
                </svg>
                {sel.map((o, i) => {
                  let ic = f.ic?.(o)
                  if (!ic) return null
                  let pos = (x: number) => ((pad + (x / f.max) * (w - 2 * pad)) / w) * 100
                  return (
                    <span
                      class="dm-range"
                      style={{ left: `${pos(ic[0])}%`, width: `${Math.max(0.5, pos(ic[1]) - pos(ic[0]))}%`, top: `${7 + i * 3}px`, background: SLOT[i] }}
                    ></span>
                  )
                })}
                {sel.map((o, i) => {
                  let v = f.get(o)
                  if (v == null) return null
                  let pct = ((pad + (v / f.max) * (w - 2 * pad)) / w) * 100
                  let ic = f.ic?.(o)
                  let shown = f.max === 100 ? `${fmt(v)} (${fmtIC(ic)})` : Number.isInteger(v) ? String(v) : v.toFixed(1)
                  return (
                    <span class="dm" style={{ left: `calc(${pct}% - 8px)` }} title={`${o.siglas}: ${shown}${f.max === 100 ? '' : `/${f.max}`}${f.just ? `\n${f.just(o)}` : ''}`}>
                      <Mark i={i} />
                    </span>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </>
    )
  }
}

export interface CaraHexagono {
  l: string
  v: number | null
  ref: number | null
}

/** Hexágono (radar de 6 ejes, escala 0-4) con la media de las demás organizaciones como referencia. */
export function Hexagon(handle: Handle<{ caras: CaraHexagono[]; nombre: string }>) {
  return () => {
    let { caras, nombre } = handle.props
    let W = 520
    let H = 420
    let cx = W / 2
    let cy = H / 2 + 4
    let R = 140
    let n = caras.length
    let ang = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / n
    let pt = (i: number, v: number) => [cx + Math.cos(ang(i)) * (R * v) / 4, cy + Math.sin(ang(i)) * (R * v) / 4] as const
    /** Los ejes sin dato se saltan: dibujarlos en 0 los haría pasar por el peor valor. */
    let poly = (vals: (number | null)[]) =>
      vals
        .map((v, i) => (v == null ? null : pt(i, v).join(',')))
        .filter(Boolean)
        .join(' ')

    return (
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: `${W}px`, display: 'block', margin: '0 auto' }} role="img" aria-label={`Hexágono de características de ${nombre}`}>
        <g class="grid">
          {[1, 2, 3, 4].map((r) => (
            <polygon points={poly(caras.map(() => r))} fill="none" stroke="var(--line)" stroke-width={r === 4 ? 1.5 : 1} />
          ))}
          {caras.map((_, i) => {
            let [x, y] = pt(i, 4)
            return <line x1={cx} y1={cy} x2={x} y2={y} stroke="var(--line)" />
          })}
        </g>
        <g class="axis">
          {[1, 2, 3, 4].map((r) => (
            <text x={cx + 4} y={cy - (R * r) / 4 - 3}>{r}</text>
          ))}
        </g>
        <polygon points={poly(caras.map((c) => c.ref))} fill="none" stroke="var(--muted)" stroke-width="1.5" stroke-dasharray="4 4" />
        <polygon points={poly(caras.map((c) => c.v))} fill="var(--accent)" fill-opacity="0.2" stroke="var(--accent)" stroke-width="2" stroke-linejoin="round" />
        {caras.map((c, i) => {
          if (c.v == null) return null
          let [x, y] = pt(i, c.v)
          return (
            <circle cx={x} cy={y} r="4.5" fill="var(--accent)" stroke="var(--surface)" stroke-width="2">
              <title>{`${c.l}: ${c.v.toFixed(1)}/4 (media de las demás: ${c.ref?.toFixed(1) ?? '—'})`}</title>
            </circle>
          )
        })}
        {caras.map((c, i) => {
          let [x, y] = pt(i, 4.55)
          let cos = Math.cos(ang(i))
          let anchor = Math.abs(cos) < 0.2 ? 'middle' : cos > 0 ? 'start' : 'end'
          let dy = Math.sin(ang(i)) < -0.5 ? -14 : Math.sin(ang(i)) > 0.5 ? 10 : -4
          return (
            <text x={x} y={y + dy} text-anchor={anchor} class="hex-label">
              <tspan x={x} class="hex-name">{c.l}</tspan>
              <tspan x={x} dy="15" class="hex-value">
                {c.v == null ? 'sin dato' : c.v.toFixed(1)}
              </tspan>
            </text>
          )
        })}
      </svg>
    )
  }
}

