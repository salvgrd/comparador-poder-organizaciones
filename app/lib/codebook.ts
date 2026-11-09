import type { Familia } from './types.ts'

export type Grupo = 'CB' | 'AG' | 'ES' | 'ajuste'

export interface Variable {
  k: string
  g: Grupo
  l: string
  /** Anclajes 0..4; cadena vacía si el valor intermedio no tiene descripción propia. */
  a: [string, string, string, string, string]
  calc?: boolean
  neg?: boolean
}

export const VARS: Variable[] = [
  { k: 'mandato', g: 'CB', l: 'Mandato imperativo', a: ['Libre: el delegado vota lo que quiere', '', 'Mixto o informal', '', 'Imperativo: lleva acuerdos escritos de su asamblea'] },
  { k: 'revocabilidad', g: 'CB', l: 'Revocabilidad', a: ['Solo al final del mandato o por órganos superiores', 'Procedimiento reforzado', 'Por el órgano que eligió', 'Por la base, con trámite', 'En cualquier momento por asamblea o pleno'] },
  { k: 'rotacion', g: 'CB', l: 'Rotación / límites', a: ['Sin límites', 'Límites laxos', 'Límite de unos 12 años', 'Límite de unos 8 años', 'Mandatos cortos (≤4 años en total)'] },
  { k: 'profesionalizacion', g: 'CB', l: 'No profesionalización', a: ['Aparato amplio de liberados y técnicos', 'Gerencia o cúpula profesional', 'Liberación parcial', 'Casi todo voluntario', 'Cargos no remunerados por estatuto'] },
  { k: 'eleccion_direccion', g: 'CB', l: 'Elección de la dirección', a: ['Cooptación', 'Indirecta a 3 o más niveles o candidatura única', 'Congreso de delegados', 'Asamblea o pleno con mandato', 'Voto directo de toda la base'] },
  { k: 'agenda_base', g: 'CB', l: 'Agenda desde la base', a: ['La dirección fija el orden del día', 'La dirección redacta y la base enmienda', 'Mixto', 'La base propone y la dirección filtra poco', 'Todo lo que propone la base entra'] },
  { k: 'pluralismo', g: 'CB', l: 'Pluralismo interno', a: ['Fracciones prohibidas', 'Disciplina fuerte', 'Votos particulares', 'Listas que compiten', 'Tendencias reconocidas con representación proporcional'] },
  { k: 'autonomia_base', g: 'CB', l: 'Autonomía de la base', a: ['Subordinada', '', 'Autonomía relativa', '', 'Plenamente autónoma (federalismo)'] },
  { k: 'proximidad', g: 'CB', l: 'Proximidad (calculada)', a: ['5 o más saltos hasta la cima', '4 saltos', '3 saltos', '2 saltos', '1 salto'], calc: true },
  { k: 'brecha_formal_real', g: 'ajuste', l: 'Brecha formal-real', a: ['El poder real coincide con los estatutos', '', 'Desviación moderada', '', 'El poder real está en otra parte (aparato, mando, portavocía)'], neg: true },
  { k: 'regla_decision', g: 'AG', l: 'Regla de decisión', a: ['Unanimidad', 'Consenso', 'Consenso con votación de reserva', 'Mayoría tras intentar el consenso', 'Mayoría simple / decide la dirección'] },
  { k: 'capacidad_ejecutiva', g: 'AG', l: 'Capacidad ejecutiva', a: ['Sin ejecutivo', 'Gestión sin capacidad de decidir', 'Coordinación con cierto margen', 'Ejecutivo con margen amplio', 'El ejecutivo fija la posición'] },
  { k: 'freq_intermedio', g: 'AG', l: 'Frecuencia del órgano intermedio', a: ['Más de 1 año', 'Cada 6-12 meses', 'Cada 2-6 meses', 'Cada 2 semanas a 2 meses', 'Semanal o más'], calc: true },
  { k: 'niveles_s', g: 'AG', l: 'Niveles a atravesar', a: ['5 o más', '4', '3', '2', '1'], calc: true },
  { k: 'estructura_federal', g: 'ES', l: 'Estructura replicable', a: ['Una sola unidad', 'Centralista', 'Coordinación incipiente', 'Federal o matricial', 'Federal y modular a cualquier escala'] },
  { k: 'coste_coordinacion', g: 'ES', l: 'Bajo coste de coordinación', a: ['Todo pasa por asamblea directa', 'Asambleas en todas las unidades para cada decisión', 'Mixto', 'Delegación con continuidad', 'Representación y aparato'] },
  { k: 'tamano_s', g: 'ES', l: 'Tamaño demostrado', a: ['~100', '~1.000', '~10.000', '~100.000', '1.000.000 o más'], calc: true },
]

export const CB_KEYS = [
  'mandato',
  'revocabilidad',
  'rotacion',
  'profesionalizacion',
  'eleccion_direccion',
  'agenda_base',
  'pluralismo',
  'autonomia_base',
  'proximidad',
] as const

export type CbKey = (typeof CB_KEYS)[number]
export type Pesos = Record<CbKey, number>

export const PESOS_POR_DEFECTO: Pesos = Object.fromEntries(CB_KEYS.map((k) => [k, 1])) as Pesos

export const FAMILIAS: Record<Familia, { label: string; color: string }> = {
  sindicato: { label: 'Sindicato', color: 'var(--s1)' },
  movimiento: { label: 'Movimiento social / territorial', color: 'var(--s2)' },
  partido: { label: 'Partido', color: 'var(--s3)' },
  cooperativa: { label: 'Autogestión productiva', color: 'var(--s4)' },
}

export const GRUPO_LABEL: Record<Grupo, string> = {
  CB: 'control de base',
  AG: 'agilidad',
  ES: 'escalabilidad',
  ajuste: 'ajuste',
}

export const TIPO_PROBLEMA: Record<string, string> = {
  democratico: 'democracia',
  escalabilidad: 'escala',
  agilidad: 'agilidad',
}

/** Las seis caras del hexágono de la ficha: cada una es la media 0-4 de sus variables. */
export const HEXAGONO: { k: string; l: string; vars: string[] }[] = [
  { k: 'mandato', l: 'Mandato y revocación', vars: ['mandato', 'revocabilidad'] },
  { k: 'rotacion', l: 'Rotación sin aparato', vars: ['rotacion', 'profesionalizacion'] },
  { k: 'eleccion', l: 'Elección desde la base', vars: ['eleccion_direccion', 'agenda_base', 'proximidad'] },
  { k: 'pluralismo', l: 'Pluralismo y autonomía', vars: ['pluralismo', 'autonomia_base'] },
  { k: 'agilidad', l: 'Agilidad', vars: ['regla_decision', 'capacidad_ejecutiva', 'freq_intermedio', 'niveles_s'] },
  { k: 'escala', l: 'Escalabilidad', vars: ['estructura_federal', 'coste_coordinacion', 'tamano_s'] },
]
