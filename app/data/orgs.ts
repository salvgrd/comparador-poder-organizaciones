import * as fs from 'node:fs/promises'
import * as path from 'node:path'

import type { Org } from '../lib/types.ts'

const DIR = path.join(process.cwd(), 'data', 'orgs')

/**
 * Lee todas las organizaciones de data/orgs/*.json en cada petición, de modo que
 * editar o añadir un archivo se refleja sin reiniciar el servidor.
 */
export async function getOrgs(): Promise<Org[]> {
  let files = (await fs.readdir(DIR)).filter((f) => f.endsWith('.json')).sort()
  let orgs = await Promise.all(
    files.map(async (f) => {
      let o = JSON.parse(await fs.readFile(path.join(DIR, f), 'utf8')) as Org
      let errores = validarOrg(o)
      if (errores.length) throw new Error(`data/orgs/${f}: ${errores.join(' ')}`)
      return o
    }),
  )
  return orgs
}

export async function getOrg(id: string): Promise<Org | undefined> {
  return (await getOrgs()).find((o) => o.id === id)
}

export function validarOrg(o: Partial<Org>): string[] {
  let errores: string[] = []
  for (let k of ['id', 'siglas', 'nombre', 'familia', 'confianza'] as const) {
    if (!o[k]) errores.push(`Falta «${k}».`)
  }
  if (!o.codigos) errores.push('Falta «codigos».')
  if (!Array.isArray(o.organos) || !o.organos.some((n) => n.tipo === 'base')) {
    errores.push('«organos» debe incluir un órgano con tipo «base».')
  } else {
    if (!o.organos.some((n) => n.cima)) errores.push('Marca un órgano con «cima»: true.')
    let ids = new Set(o.organos.map((n) => n.id))
    for (let n of o.organos) {
      for (let e of n.elegido_por ?? []) {
        if (!ids.has(e)) errores.push(`El órgano «${n.id}» apunta a «${e}», que no existe.`)
      }
    }
  }
  return errores
}
