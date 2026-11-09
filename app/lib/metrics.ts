import { CB_KEYS, type Pesos } from './codebook.ts'
import type { Org } from './types.ts'

export interface Indices {
  /** Saltos desde la base hasta el órgano marcado como cima. */
  hops: number | null
  /** Saltos desde la base hasta cada órgano. */
  hopsPorOrgano: Record<string, number>
  cb: number | null
  cbBruto: number | null
  ag: number | null
  es: number | null
  olig: number | null
  brecha: number
  tamanoS: number | null
  /** Valor 0-4 de cualquier variable del libro de códigos, incluidas las calculadas. */
  val: (k: string) => number | null
}

export type OrgConIndices = Org & { indices: Indices }

const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x))

function raw(o: Org, k: string): number | null {
  let c = o.codigos[k]
  return Array.isArray(c) && typeof c[0] === 'number' ? c[0] : null
}

export function saltos(o: Org): { porOrgano: Record<string, number>; cima: number | null } {
  let d: Record<string, number> = {}
  for (let n of o.organos) if (n.tipo === 'base') d[n.id] = 0
  for (let it = 0; it < o.organos.length + 2; it++) {
    for (let n of o.organos) {
      let ds = (n.elegido_por ?? []).map((e) => d[e]).filter((x): x is number => x != null)
      if (ds.length) {
        let nv = 1 + Math.min(...ds)
        if (d[n.id] == null || nv < d[n.id]) d[n.id] = nv
      }
    }
  }
  let top = o.organos.find((n) => n.cima)
  return { porOrgano: d, cima: top && d[top.id] != null ? d[top.id] : null }
}

export const freqScore = (m: number | null) =>
  m == null ? null : m <= 0.5 ? 4 : m <= 2 ? 3 : m <= 6 ? 2 : m <= 12 ? 1 : 0
export const nivelesScore = (n: number | null) => (n == null ? null : clamp(5 - n, 0, 4))
export const tamanoScore = (n: number | null | undefined) =>
  n ? clamp(Math.log10(n) - 2, 0, 4) : null

const media = (a: (number | null)[]) => {
  let f = a.filter((x): x is number => x != null)
  return f.length ? f.reduce((p, c) => p + c, 0) / f.length : null
}

export function calcularIndices(o: Org, pesos: Pesos): Indices {
  let h = saltos(o)
  let derivadas: Record<string, number | null> = {
    proximidad: h.cima == null ? null : clamp(5 - h.cima, 0, 4),
    freq_intermedio: freqScore(raw(o, 'freq_intermedio_meses')),
    niveles_s: nivelesScore(raw(o, 'niveles')),
    tamano_s: tamanoScore(o.tamano?.[0]),
  }
  let val = (k: string) => (k in derivadas ? derivadas[k] : raw(o, k))

  let num = 0
  let den = 0
  for (let k of CB_KEYS) {
    let x = val(k)
    if (x != null && pesos[k] > 0) {
      num += pesos[k] * x
      den += pesos[k]
    }
  }
  let brecha = raw(o, 'brecha_formal_real') ?? 0
  let cbBruto = den ? (num / den) * 25 : null
  let ag = media([val('regla_decision'), val('capacidad_ejecutiva'), val('freq_intermedio'), val('niveles_s')])
  let es = media([val('estructura_federal'), val('coste_coordinacion'), val('tamano_s')])
  let p = val('profesionalizacion')
  let r = val('rotacion')
  let e = val('eleccion_direccion')
  let tam = derivadas.tamano_s ?? 0

  return {
    hops: h.cima,
    hopsPorOrgano: h.porOrgano,
    cbBruto,
    cb: cbBruto == null ? null : cbBruto * (1 - (0.5 * brecha) / 4),
    ag: ag == null ? null : ag * 25,
    es: es == null ? null : es * 25,
    olig:
      p == null || r == null || e == null
        ? null
        : (((4 - p) + (4 - r) + (4 - e) + brecha) / 16) * (0.5 + (0.5 * tam) / 4) * 100,
    brecha,
    tamanoS: derivadas.tamano_s,
    val,
  }
}

export function conIndices(orgs: Org[], pesos: Pesos): OrgConIndices[] {
  return orgs.map((o) => ({ ...o, indices: calcularIndices(o, pesos) }))
}

export function pearson(xs: number[], ys: number[]): number {
  let n = xs.length
  let mx = xs.reduce((a, b) => a + b, 0) / n
  let my = ys.reduce((a, b) => a + b, 0) / n
  let sxy = 0
  let sx = 0
  let sy = 0
  for (let i = 0; i < n; i++) {
    let a = xs[i] - mx
    let b = ys[i] - my
    sxy += a * b
    sx += a * a
    sy += b * b
  }
  return sxy / Math.sqrt(sx * sy)
}

export const fmt = (x: number | null | undefined) => (x == null ? '—' : String(Math.round(x)))

export function fmtN(n: number | null | undefined): string {
  if (n == null) return '—'
  if (n >= 1e6) return (n / 1e6).toLocaleString('es-ES', { maximumFractionDigits: 1 }) + ' M'
  if (n >= 1e3) return Math.round(n / 1e3).toLocaleString('es-ES') + ' mil'
  return n.toLocaleString('es-ES')
}
