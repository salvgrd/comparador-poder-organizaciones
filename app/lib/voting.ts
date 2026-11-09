export interface Unidad {
  n: string
  a: number
}

export interface Esquema {
  l: string
  f: (n: number) => number
}

export const ESQUEMAS: Record<string, Esquema> = {
  cnt_sind: {
    l: 'CNT · sindicatos en Pleno/Congreso (art. 62)',
    f: (n) =>
      n < 15 ? 1 : n <= 20 ? 2 : n <= 30 ? 3 : n <= 40 ? 4 : n <= 50 ? 5 : n <= 60 ? 6 : n <= 70 ? 7 : n <= 80 ? 8 : n <= 90 ? 9 : n <= 100 ? 10 : n <= 150 ? 11 : n <= 250 ? 12 : n <= 500 ? 13 : n <= 1000 ? 14 : 15,
  },
  cnt_reg: {
    l: 'CNT · Regionales en Pleno Confederal',
    f: (n) => {
      let t: [number, number][] = [[100, 1], [200, 2], [300, 3], [400, 4], [500, 5], [600, 6], [700, 7], [800, 8], [900, 9], [1000, 10], [1250, 11], [1500, 12], [2000, 13], [3000, 14], [5000, 15], [10000, 16]]
      for (let [m, v] of t) if (n <= m) return v
      return 17
    },
  },
  cgt_cong: {
    // Tramo >300 («1 voto por cada 100 o fracción») leído como 7 + 1 por cada 100 adicionales.
    l: 'CGT · Congreso (art. 8 Reglamento)',
    f: (n) => n < 10 ? 0 : n <= 50 ? 1 : n <= 75 ? 2 : n <= 100 ? 3 : n <= 150 ? 4 : n <= 200 ? 5 : n <= 250 ? 6 : n <= 300 ? 7 : 7 + Math.ceil((n - 300) / 100),
  },
  cgt_cc: {
    l: 'CGT · Comité Confederal (art. 45)',
    f: (n) => n <= 100 ? 1 : n <= 500 ? 2 : n <= 1000 ? 3 : n <= 2000 ? 4 : 4 + Math.ceil((n - 2000) / 2000),
  },
  prop: { l: 'Proporcional puro (1 afiliada = 1 voto)', f: (n) => n },
  sqrt: { l: 'Raíz cuadrada (Penrose)', f: (n) => Math.max(1, Math.round(Math.sqrt(n))) },
  equal: { l: 'Igualitario (1 unidad = 1 voto)', f: () => 1 },
}

export const UNIDADES_EJEMPLO =
  'Sindicato A:1200\nSindicato B:640\nSindicato C:310\nSindicato D:180\nSindicato E:120\nSindicato F:95\nSindicato G:60\nSindicato H:45\nSindicato I:32\nSindicato J:24\nSindicato K:18\nSindicato L:16'

export function parseUnidades(t: string): Unidad[] {
  return t
    .split(/\n|;/)
    .map((x) => x.trim())
    .filter(Boolean)
    .map((x, i) => {
      let m = x.match(/^(.*?)[:=\t,]\s*([\d.]+)\s*$/)
      if (m) return { n: m[1].trim() || `U${i + 1}`, a: Math.round(+m[2].replace(/\./g, '')) }
      let k = +x.replace(/\./g, '')
      return Number.isNaN(k) ? null : { n: `U${i + 1}`, a: k }
    })
    .filter((u): u is Unidad => u != null && u.a > 0)
}

export interface Analisis {
  w: number[]
  total: number
  q: number
  /** Índice de Banzhaf normalizado. */
  bz: number[]
  share: number[]
  /** Fracción mínima de la afiliación que alcanza el umbral. */
  mwc: number
  /** Desproporcionalidad de Loosemore-Hanby entre afiliación y poder. */
  lh: number
  ratio: number
  escalado: boolean
}

export function analizar(units: Unidad[], esquema: string, umbral: number): Analisis {
  let w = units.map((u) => ESQUEMAS[esquema].f(u.a))
  let total = w.reduce((a, b) => a + b, 0)
  let escalado = false
  if (total > 6000) {
    let s = 6000 / total
    w = w.map((x) => Math.max(1, Math.round(x * s)))
    total = w.reduce((a, b) => a + b, 0)
    escalado = true
  }
  let q = umbral === 0.5 ? Math.floor(total / 2) + 1 : Math.ceil(total * umbral - 1e-9)
  let n = units.length

  let swings = new Array<number>(n).fill(0)
  for (let i = 0; i < n; i++) {
    let dp = new Float64Array(total + 1)
    dp[0] = 1
    let mx = 0
    for (let j = 0; j < n; j++) {
      if (j === i) continue
      for (let s = mx; s >= 0; s--) if (dp[s]) dp[s + w[j]] += dp[s]
      mx += w[j]
    }
    let c = 0
    for (let s = Math.max(0, q - w[i]); s < q && s <= total; s++) c += dp[s]
    swings[i] = c
  }
  let sw = swings.reduce((a, b) => a + b, 0) || 1
  let bz = swings.map((x) => x / sw)

  let A = units.reduce((s, u) => s + u.a, 0)
  let best = new Float64Array(total + 1).fill(Infinity)
  best[0] = 0
  let mx = 0
  units.forEach((u, j) => {
    for (let s = mx; s >= 0; s--) {
      if (best[s] < Infinity && best[s] + u.a < best[s + w[j]]) best[s + w[j]] = best[s] + u.a
    }
    mx += w[j]
  })
  let mwc = Infinity
  for (let s = q; s <= total; s++) if (best[s] < mwc) mwc = best[s]

  let share = units.map((u) => u.a / A)
  let lh = 0.5 * share.reduce((s, x, i) => s + Math.abs(x - bz[i]), 0)
  let vpa = units.map((u, i) => w[i] / u.a)
  return { w, total, q, bz, share, mwc: mwc / A, lh, ratio: Math.max(...vpa) / Math.min(...vpa), escalado }
}

export const pct = (x: number, d = 1) =>
  (x * 100).toLocaleString('es-ES', { maximumFractionDigits: d, minimumFractionDigits: d }) + '%'
