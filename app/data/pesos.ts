import { createCookie } from 'remix/cookie'

import { CB_KEYS, PESOS_POR_DEFECTO, type Pesos } from '../lib/codebook.ts'

export const pesosCookie = createCookie('pesos', {
  path: '/',
  sameSite: 'Lax',
  maxAge: 60 * 60 * 24 * 365,
})

export async function leerPesos(request: Request): Promise<Pesos> {
  let pesos = { ...PESOS_POR_DEFECTO }
  try {
    let raw = await pesosCookie.parse(request.headers.get('Cookie'))
    let guardados = typeof raw === 'string' ? JSON.parse(raw) : raw
    for (let k of CB_KEYS) {
      let v = Number(guardados?.[k])
      if (Number.isFinite(v)) pesos[k] = clampPeso(v)
    }
  } catch {
    // Cookie ausente o corrupta: pesos por defecto.
  }
  return pesos
}

export function pesosDesdeFormulario(form: FormData): Pesos {
  let pesos = { ...PESOS_POR_DEFECTO }
  for (let k of CB_KEYS) {
    let v = Number(form.get(k))
    if (Number.isFinite(v)) pesos[k] = clampPeso(v)
  }
  return pesos
}

export const sonPorDefecto = (p: Pesos) => CB_KEYS.every((k) => p[k] === PESOS_POR_DEFECTO[k])

const clampPeso = (v: number) => Math.max(0, Math.min(3, Math.round(v * 2) / 2))
