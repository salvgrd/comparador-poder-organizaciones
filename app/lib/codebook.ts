import type { Familia, Org, Situacion, TipoFracaso } from './types.ts'

export type Grupo = 'CB' | 'AG' | 'CE' | 'ES' | 'ajuste' | 'contexto'

export interface Variable {
  k: string
  g: Grupo
  l: string
  /** Anclajes 0..4; cadena vacía si el valor intermedio no tiene descripción propia. */
  a: [string, string, string, string, string]
  calc?: boolean
  /** Regla de aplicación que no cabe en los anclajes. */
  nota?: string
  /** Si el valor alto no significa «más» del índice al que pertenece, qué significa. Invierte el color. */
  alto?: string
}

/**
 * Regla general: las variables de estructura codifican lo que dicen los estatutos y las normas vinculantes
 * (reglamentos, códigos éticos). La distancia con la práctica va solo en «brecha_formal_real».
 */
export const REGLA_FORMAL =
  'Cada variable de estructura se codifica según los estatutos y las normas vinculantes (reglamentos, códigos éticos). Lo que pasa en la práctica va solo en la brecha formal-real, para no contarlo dos veces.'

/** Qué órgano se marca como «cima» en el organigrama. Las variables que hablan de «la dirección» se refieren a él. */
export const REGLA_CIMA =
  'La cima es el órgano ejecutivo permanente de mayor nivel: el que actúa entre reuniones de los órganos colectivos. Si una secretaría general o una presidencia se elige aparte y preside ese órgano, la cima es esa secretaría. Sin ejecutivo, es el órgano de coordinación permanente. En las cooperativas es el Consejo Rector (o su equivalente en las de segundo grado), aunque delegue la gestión diaria en una gerencia.'

export const VARS: Variable[] = [
  { k: 'mandato', g: 'CB', l: 'Mandato imperativo', a: ['Libre: el delegado vota lo que quiere, o no hay delegados (voto directo sin deliberación previa)', '', 'Mixto, o mandato habitual pero no normado', '', 'Imperativo y normado: lleva acuerdos escritos de su asamblea'] },
  { k: 'revocabilidad', g: 'CB', l: 'Revocabilidad', a: ['Solo al final del mandato o por un órgano superior', 'Cualquiera de las siguientes con trámite reforzado (umbral ≥ 20 %, plazo mínimo o un solo intento), o solo en un congreso extraordinario', 'Por un órgano delegado que se reúne al menos una vez al año, sin trámite reforzado', 'Por la base, con trámite ordinario', 'Por la base o su asamblea, en cualquier momento y sin trámite'], nota: 'Se codifica la revocación de la cima. Un pleno o congreso de delegaciones con mandato imperativo de sus asambleas cuenta como la base.' },
  { k: 'rotacion', g: 'CB', l: 'Rotación (años máximos seguidos en el cargo de la cima)', a: ['Sin límite', 'Más de 12 años, o prorrogable sin tope', 'Unos 12 años', 'Unos 8 años', '4 años o menos'] },
  { k: 'profesionalizacion', g: 'CB', l: 'No profesionalización', a: ['Dirección siempre remunerada y aparato amplio (más de 1 liberada por cada 1.000 afiliadas)', 'Dirección remunerada y aparato técnico pequeño', 'Solo algunos cargos liberados', 'Liberaciones temporales o por campaña', 'Cargos no remunerados por estatuto'] },
  { k: 'eleccion_direccion', g: 'CB', l: 'Elección de la dirección', a: ['Cooptación', 'Indirecta a 3 o más niveles o candidatura única', 'Congreso de delegados, o liderazgo unipersonal por voto directo (plebiscitario)', 'Asamblea o pleno con mandato', 'Voto directo de toda la base a órganos colegiados revocables, o asamblea general'] },
  { k: 'agenda_base', g: 'CB', l: 'Agenda desde la base', a: ['La dirección fija el orden del día', 'La dirección redacta y la base enmienda', 'Mixto', 'La base propone y la dirección filtra poco', 'Todo lo que propone la base entra'] },
  { k: 'pluralismo', g: 'CB', l: 'Pluralismo interno', a: ['Fracciones prohibidas', 'Disciplina fuerte, sin cauces para la minoría', 'Votos particulares o enmiendas de minoría', 'Sistema electoral que garantiza puestos a la minoría (proporcional o con cuota)', 'Lo anterior y corrientes reconocidas con al menos dos de: portavocía, recursos, representación'], nota: 'Sin elecciones internas competitivas, el máximo es 2.' },
  { k: 'autonomia_base', g: 'CB', l: 'Autonomía de la base', a: ['Subordinada', '', 'Autonomía relativa', '', 'Plenamente autónoma (federalismo)'] },
  { k: 'proximidad', g: 'CB', l: 'Proximidad con mandato (calculada)', a: ['Lejos de la cima, o sin mandato ni revocación', '', 'Cerca con control parcial, o lejos con mandato', '', '1 salto con mandato imperativo y revocación inmediata'], calc: true },
  { k: 'brecha_formal_real', g: 'ajuste', l: 'Brecha formal-real', a: ['El poder real coincide con los estatutos', '', 'Desviación moderada', '', 'El poder real está en otra parte (aparato, mando, portavocía)'], alto: 'alto = peor' },
  { k: 'regla_decision', g: 'CE', l: 'Regla de decisión', a: ['Unanimidad', 'Consenso', 'Consenso con votación de reserva', 'Mayoría tras intentar el consenso', 'Mayoría simple / decide la dirección'] },
  { k: 'capacidad_ejecutiva', g: 'CE', l: 'Capacidad ejecutiva', a: ['Sin ejecutivo', 'Solo administra y transmite', 'Ejecuta con margen operativo, sin poder fijar posición nueva', 'Decide entre reuniones; lo urgente o de fondo se ratifica después', 'Fija posiciones o acuerdos nuevos sin ratificación'], nota: 'Se codifica la regla general de la cima, no la excepción de urgencia.' },
  { k: 'freq_intermedio', g: 'AG', l: 'Frecuencia del órgano intermedio', a: ['Más de 1 año', 'Cada 6-12 meses', 'Cada 2-6 meses', 'Cada 2 semanas a 2 meses', 'Semanal o más'], calc: true },
  { k: 'freq_soberano', g: 'AG', l: 'Frecuencia del órgano soberano', a: ['Más de 1 año', 'Cada 6-12 meses', 'Cada 2-6 meses', 'Cada 2 semanas a 2 meses', 'Semanal o más'], calc: true },
  { k: 'niveles_s', g: 'AG', l: 'Niveles a atravesar (saltos)', a: ['5 o más saltos hasta la cima', '4 saltos', '3 saltos', '2 saltos', '1 salto'], calc: true },
  { k: 'estructura_federal', g: 'ES', l: 'Estructura replicable', a: ['Una sola unidad', 'Centralista', 'Unidades territoriales con poco poder propio', 'Federal o matricial, pero el centro concede cartas o aprueba estatutos', 'La misma unidad, con su asamblea soberana, se repite en todos los niveles y se añaden unidades sin aprobación del centro'] },
  { k: 'coste_coordinacion', g: 'ES', l: 'Bajo coste de coordinación', a: ['Todo pasa por asamblea directa', 'Asambleas en todas las unidades para cada decisión', 'Mixto', 'Delegación con continuidad', 'Representación y aparato'] },
  { k: 'tamano_s', g: 'contexto', l: 'Tamaño demostrado', a: ['~100', '~1.000', '~10.000', '~100.000', '1.000.000 o más'], calc: true },
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
  AG: 'agilidad vía base',
  CE: 'agilidad vía dirección',
  ES: 'escalabilidad',
  ajuste: 'ajuste',
  contexto: 'contexto (no puntúa)',
}

export const TIPO_PROBLEMA: Record<string, string> = {
  democratico: 'democracia',
  escalabilidad: 'escala',
  agilidad: 'agilidad',
}

/** Variables de cada índice. Un único sitio para que el cálculo, la ficha y el método no diverjan. */
export const AG_KEYS = ['freq_intermedio', 'freq_soberano', 'niveles_s'] as const
export const CE_KEYS = ['regla_decision', 'capacidad_ejecutiva'] as const
export const ES_KEYS = ['estructura_federal', 'coste_coordinacion'] as const

/** Unidades de «tamano». Solo las de membresía se puntúan en «tamaño demostrado». */
export const UNIDADES_TAMANO = {
  afiliacion: { l: 'afiliadas o militantes', corto: 'afiliación', comparable: true },
  trabajadoras: { l: 'trabajadoras', corto: 'trabajadoras', comparable: true },
  activistas: { l: 'personas activas', corto: 'activistas', comparable: true },
  familias: { l: 'familias', corto: 'familias', comparable: false },
  poblacion: { l: 'población gobernada', corto: 'población', comparable: false },
} as const
export type UnidadTamano = keyof typeof UNIDADES_TAMANO

/**
 * Caras del hexágono de la ficha: cada una es la media 0-4 de sus variables. La de agilidad usa solo la vía
 * base, para que el hexágono mida una sola cosa hacia fuera (poder y rapidez de los órganos colectivos).
 */
export const HEXAGONO: { k: string; l: string; vars: string[] }[] = [
  { k: 'mandato', l: 'Mandato y revocación', vars: ['mandato', 'revocabilidad'] },
  { k: 'rotacion', l: 'Rotación sin aparato', vars: ['rotacion', 'profesionalizacion'] },
  { k: 'eleccion', l: 'Elección desde la base', vars: ['eleccion_direccion', 'agenda_base', 'proximidad'] },
  { k: 'pluralismo', l: 'Pluralismo y autonomía', vars: ['pluralismo', 'autonomia_base'] },
  { k: 'agilidad', l: 'Agilidad vía base', vars: [...AG_KEYS] },
  { k: 'escala', l: 'Escalabilidad', vars: [...ES_KEYS] },
]

export const SITUACIONES: Record<Situacion, string> = {
  activa: 'activa',
  disuelta: 'disuelta',
  escindida: 'escindida',
  burocratizada: 'burocratizada',
  inactiva: 'inactiva',
}

export const TIPOS_FRACASO: Record<TipoFracaso, string> = {
  escision: 'escisión',
  colapso_escala: 'no aguantó la escala',
  captura_direccion: 'captura por la dirección',
  institucionalizacion: 'institucionalización',
  degeneracion: 'degeneración cooperativa',
  colapso_economico: 'quiebra',
  represion: 'represión',
  fragmentacion: 'fragmentación',
  desmovilizacion: 'desmovilización',
}

/** Casos que ya no funcionan como organización de base: entran en la muestra contra el sesgo de supervivencia. */
export const esFracaso = (o: Pick<Org, 'estado'>) => o.estado != null && o.estado.situacion !== 'activa'

export const etiquetaEstado = (o: Pick<Org, 'estado'>) =>
  esFracaso(o) ? `${SITUACIONES[o.estado!.situacion]}${o.estado!.desde ? ` en ${o.estado!.desde}` : ''}` : null

export const SIN_FUENTE = 'Sin fuente verificable'

/** Mínimo de códigos manuales con fuente para que una ficha cuente como «con fuentes». */
export const UMBRAL_FUENTES = 0.75

/** Códigos codificados a mano (incluidas las frecuencias) con fuente verificable (los que faltan o empiezan por «Sin fuente verificable» no cuentan). */
export function coberturaFuentes(o: Pick<Org, 'codigos'>): { con: number; total: number; ratio: number } {
  let manuales = [...VARS.filter((v) => !v.calc).map((v) => v.k), 'freq_intermedio_meses', 'freq_soberano_meses']
  let con = manuales.filter((k) => {
    let c = o.codigos[k]
    return Array.isArray(c) && typeof c[0] === 'number' && !String(c[1] ?? '').startsWith(SIN_FUENTE)
  }).length
  return { con, total: manuales.length, ratio: manuales.length ? con / manuales.length : 0 }
}

export const conFuentes = (o: Pick<Org, 'codigos'>) => coberturaFuentes(o).ratio >= UMBRAL_FUENTES
