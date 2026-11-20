import { AG_KEYS, CB_KEYS, CE_KEYS, ES_KEYS, UNIDADES_TAMANO, type Pesos } from './codebook.ts'
import type { Confianza, Org } from './types.ts'

export const CLAVES_INDICE = ['cb', 'ag', 'agb', 'ce', 'es', 'olig'] as const
export type ClaveIndice = (typeof CLAVES_INDICE)[number]
export type Intervalo = [number, number]

export interface Indices {
  /** Saltos desde la base hasta el órgano marcado como cima. */
  hops: number | null
  /** Saltos desde la base hasta cada órgano. */
  hopsPorOrgano: Record<string, number>
  cb: number | null
  cbBruto: number | null
  /** Agilidad total: media de la vía base y la vía dirección. */
  ag: number | null
  /** Agilidad vía base: frecuencia de los órganos y saltos, sin depender de la dirección. */
  agb: number | null
  /** Agilidad vía dirección: regla de decisión y capacidad ejecutiva (es centralización). */
  ce: number | null
  es: number | null
  olig: number | null
  brecha: number | null
  tamanoS: number | null
  /** Valor 0-4 de cualquier variable del libro de códigos, incluidas las calculadas. */
  val: (k: string) => number | null
  /** Confianza del dato del que sale la variable (para las calculadas, la de su código de origen). */
  conf: (k: string) => Confianza | null
}

export type IndicesConIncertidumbre = Indices & {
  /** Intervalo del 90 % de cada índice bajo perturbación de los códigos según su confianza. */
  ic: Record<ClaveIndice, Intervalo | null>
  /** Puesto en control de base (1 = más control) y su intervalo del 90 %. */
  puestoCb: number | null
  puestoCbIc: Intervalo | null
}

export type OrgConIndices = Org & { indices: IndicesConIncertidumbre }

/** Recibe la clave, el valor 0-4 y la confianza de un código y devuelve el valor a usar. */
export type Perturbacion = (k: string, x: number, c: Confianza) => number

const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x))

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
  m == null ? null : m <= 0.25 ? 4 : m <= 2 ? 3 : m <= 6 ? 2 : m <= 12 ? 1 : 0
export const nivelesScore = (n: number | null) => (n == null ? null : clamp(5 - n, 0, 4))
export const tamanoScore = (n: number | null | undefined) =>
  n ? clamp(Math.log10(n) - 2, 0, 4) : null

/**
 * Control que conserva la base sobre la cima: 4 · c^saltos, con c = (mandato + revocabilidad) / 8.
 * Con mandato imperativo y revocación inmediata (c = 1) los saltos no diluyen nada; sin ellos, cada salto
 * diluye, y una elección directa sin mandato (plebiscito) tampoco puntúa alto.
 */
export function proximidadScore(hops: number | null, mandato: number | null, revocabilidad: number | null) {
  if (hops == null) return null
  let ctrl = [mandato, revocabilidad].filter((x): x is number => x != null)
  if (!ctrl.length) return null
  let c = ctrl.reduce((a, b) => a + b, 0) / (4 * ctrl.length)
  return 4 * c ** Math.max(1, hops)
}

export const tamanoComparable = (o: Org) => UNIDADES_TAMANO[o.tamano_unidad ?? 'afiliacion']?.comparable ?? false

const media = (a: (number | null)[]) => {
  let f = a.filter((x): x is number => x != null)
  return f.length ? f.reduce((p, c) => p + c, 0) / f.length : null
}

export function calcularIndices(o: Org, pesos: Pesos, perturbar?: Perturbacion, h = saltos(o)): Indices {
  let codigo = (k: string) => {
    let c = o.codigos[k]
    return Array.isArray(c) && typeof c[0] === 'number' ? c : null
  }
  let p = (k: string, x: number | null, c: Confianza | null | undefined) =>
    x == null || !perturbar ? x : perturbar(k, x, c ?? 'baja')
  let raw = (k: string) => {
    let c = codigo(k)
    return c ? p(k, c[0], c[2]) : null
  }
  let origen: Record<string, string> = {
    freq_intermedio: 'freq_intermedio_meses',
    freq_soberano: 'freq_soberano_meses',
  }
  let conf = (k: string): Confianza | null => {
    if (k === 'tamano_s') return o.tamano?.[2] ?? null
    if (k === 'proximidad') {
      let cs = [codigo('mandato')?.[2], codigo('revocabilidad')?.[2]]
      return cs.includes('baja') ? 'baja' : cs.includes('media') ? 'media' : cs.includes('alta') ? 'alta' : null
    }
    return codigo(origen[k] ?? k)?.[2] ?? null
  }
  let derivada = (k: string, x: number | null) => p(k, x, conf(k))

  let derivadas: Record<string, number | null> = {
    proximidad: proximidadScore(h.cima, raw('mandato'), raw('revocabilidad')),
    freq_intermedio: derivada('freq_intermedio', freqScore(codigo('freq_intermedio_meses')?.[0] ?? null)),
    freq_soberano: derivada('freq_soberano', freqScore(codigo('freq_soberano_meses')?.[0] ?? null)),
    /** Del organigrama, como la proximidad: es estructura, no estimación, y no se perturba. */
    niveles_s: nivelesScore(h.cima),
    tamano_s: tamanoComparable(o) ? derivada('tamano_s', tamanoScore(o.tamano?.[0])) : null,
  }
  let cache: Record<string, number | null> = { ...derivadas }
  let val = (k: string) => (k in cache ? cache[k] : (cache[k] = raw(k)))

  let num = 0
  let den = 0
  for (let k of CB_KEYS) {
    let x = val(k)
    if (x != null && pesos[k] > 0) {
      num += pesos[k] * x
      den += pesos[k]
    }
  }
  let brecha = val('brecha_formal_real')
  let cbBruto = den ? (num / den) * 25 : null
  let ag = media([...AG_KEYS, ...CE_KEYS].map(val))
  let agb = media(AG_KEYS.map(val))
  let ce = media(CE_KEYS.map(val))
  let es = media(ES_KEYS.map(val))
  let pr = val('profesionalizacion')
  let r = val('rotacion')
  let e = val('eleccion_direccion')
  let tam = derivadas.tamano_s

  return {
    hops: h.cima,
    hopsPorOrgano: h.porOrgano,
    cbBruto,
    cb: cbBruto == null || brecha == null ? null : cbBruto * (1 - (0.5 * brecha) / 4),
    ag: ag == null ? null : ag * 25,
    agb: agb == null ? null : agb * 25,
    ce: ce == null ? null : ce * 25,
    es: es == null ? null : es * 25,
    olig:
      pr == null || r == null || e == null || brecha == null || tam == null
        ? null
        : ((4 - pr + (4 - r) + (4 - e) + brecha) / 16) * (0.5 + (0.5 * tam) / 4) * 100,
    brecha,
    tamanoS: tam,
    val,
    conf,
  }
}

/** Probabilidad de que un código esté desviado ±1 punto, según su confianza. */
export const PROB_ERROR: Record<Confianza, number> = { alta: 0.1, media: 0.25, baja: 0.5 }
export const SIMULACIONES = 400

function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function cuantil(xs: number[], q: number) {
  let s = [...xs].sort((a, b) => a - b)
  let i = (s.length - 1) * q
  let lo = Math.floor(i)
  return s[lo] + (s[Math.ceil(i)] - s[lo]) * (i - lo)
}

const intervalo = (xs: number[]): Intervalo | null => (xs.length ? [cuantil(xs, 0.05), cuantil(xs, 0.95)] : null)

/** Puesto de cada valor (1 = el mayor); los empates comparten el mejor puesto. */
function puestos(xs: (number | null)[]): (number | null)[] {
  return xs.map((x) => (x == null ? null : 1 + xs.filter((y) => y != null && y > x + 1e-9).length))
}

/**
 * Índices de todas las organizaciones con su incertidumbre: en cada simulación, cada código se desvía
 * ±1 con la probabilidad de PROB_ERROR según su confianza. La semilla es fija para que la página no
 * cambie entre recargas.
 */
export function conIndices(orgs: Org[], pesos: Pesos, n = SIMULACIONES): OrgConIndices[] {
  let hs = orgs.map((o) => saltos(o))
  let puntual = orgs.map((o, i) => calcularIndices(o, pesos, undefined, hs[i]))
  let rand = mulberry32(20261119)
  let perturbar: Perturbacion = (_k, x, c) => (rand() < PROB_ERROR[c] ? clamp(x + (rand() < 0.5 ? -1 : 1), 0, 4) : x)
  let draws = orgs.map(() => Object.fromEntries(CLAVES_INDICE.map((k) => [k, [] as number[]])) as Record<ClaveIndice, number[]>)
  let rangos = orgs.map(() => [] as number[])
  for (let s = 0; s < n; s++) {
    let sim = orgs.map((o, i) => calcularIndices(o, pesos, perturbar, hs[i]))
    sim.forEach((x, i) => {
      for (let k of CLAVES_INDICE) if (x[k] != null) draws[i][k].push(x[k]!)
    })
    puestos(sim.map((x) => x.cb)).forEach((r, i) => r != null && rangos[i].push(r))
  }
  let puestoPuntual = puestos(puntual.map((x) => x.cb))
  return orgs.map((o, i) => {
    let ic = Object.fromEntries(CLAVES_INDICE.map((k) => [k, puntual[i][k] == null ? null : intervalo(draws[i][k])])) as Record<
      ClaveIndice,
      Intervalo | null
    >
    let pic = intervalo(rangos[i])
    return {
      ...o,
      indices: {
        ...puntual[i],
        ic,
        puestoCb: puestoPuntual[i],
        puestoCbIc: pic && puestoPuntual[i] != null ? [Math.round(pic[0]), Math.round(pic[1])] : null,
      },
    }
  })
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
  return sx && sy ? sxy / Math.sqrt(sx * sy) : NaN
}

/** Intervalo de confianza del 95 % de una correlación de Pearson (transformación z de Fisher). */
export function pearsonIC(r: number, n: number): Intervalo | null {
  if (!Number.isFinite(r) || n < 4) return null
  let z = Math.atanh(clamp(r, -0.999999, 0.999999))
  let se = 1 / Math.sqrt(n - 3)
  return [Math.tanh(z - 1.96 * se), Math.tanh(z + 1.96 * se)]
}

export type Banda = 'bajo' | 'medio' | 'alto'
const BANDAS: Banda[] = ['bajo', 'medio', 'alto']
export const banda = (x: number): Banda => BANDAS[x < 100 / 3 ? 0 : x < 200 / 3 ? 1 : 2]

/** Banda de un índice 0-100 teniendo en cuenta su intervalo: «medio–alto» si el intervalo cruza el corte. */
export function bandaTexto(x: number | null, ic?: Intervalo | null): string {
  if (x == null) return '—'
  if (!ic) return banda(x)
  let a = banda(ic[0])
  let b = banda(ic[1])
  return a === b ? a : `${a}–${b}`
}

export const fmt = (x: number | null | undefined) => (x == null ? '—' : String(Math.round(x)))
export const fmtIC = (ic: Intervalo | null | undefined) => (ic ? `${Math.round(ic[0])}–${Math.round(ic[1])}` : '')
export const fmtPuesto = (p: number | null, ic: Intervalo | null) =>
  p == null ? '—' : ic && ic[0] !== ic[1] ? `${ic[0]}.º–${ic[1]}.º` : `${p}.º`

export function fmtN(n: number | null | undefined): string {
  if (n == null) return '—'
  if (n >= 1e6) return (n / 1e6).toLocaleString('es-ES', { maximumFractionDigits: 1 }) + ' M'
  if (n >= 1e3) return Math.round(n / 1e3).toLocaleString('es-ES') + ' mil'
  return n.toLocaleString('es-ES')
}
