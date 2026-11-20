import * as fs from 'node:fs/promises'
import * as path from 'node:path'

import { SITUACIONES, TIPOS_FRACASO, UNIDADES_TAMANO } from '../lib/codebook.ts'
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
    let cimas = o.organos.filter((n) => n.cima).length
    if (cimas !== 1) errores.push(`Marca exactamente un órgano con «cima»: true (hay ${cimas}).`)
    let ids = new Set(o.organos.map((n) => n.id))
    for (let n of o.organos) {
      for (let e of n.elegido_por ?? []) {
        if (!ids.has(e)) errores.push(`El órgano «${n.id}» apunta a «${e}», que no existe.`)
      }
    }
  }
  if (o.tamano_unidad && !(o.tamano_unidad in UNIDADES_TAMANO)) {
    errores.push(`«tamano_unidad» debe ser una de: ${Object.keys(UNIDADES_TAMANO).join(', ')}.`)
  }
  if (o.estado) {
    let e = o.estado
    if (!(e.situacion in SITUACIONES)) errores.push(`«estado.situacion» debe ser una de: ${Object.keys(SITUACIONES).join(', ')}.`)
    for (let t of e.tipos ?? []) {
      if (!(t in TIPOS_FRACASO)) errores.push(`«estado.tipos» incluye «${t}»; debe ser de: ${Object.keys(TIPOS_FRACASO).join(', ')}.`)
    }
    if (e.situacion !== 'activa') {
      if (!e.tipos?.length) errores.push('Un caso no activo necesita «estado.tipos».')
      if (!e.causa) errores.push('Un caso no activo necesita «estado.causa».')
      if (!e.momento_codificado) errores.push('Un caso no activo necesita «estado.momento_codificado».')
    }
  }
  return errores
}
