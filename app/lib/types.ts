import type { UnidadTamano } from './codebook.ts'

export type Confianza = 'alta' | 'media' | 'baja'
export type Familia = 'sindicato' | 'movimiento' | 'partido' | 'cooperativa'
export type TipoOrgano =
  | 'base'
  | 'asamblea'
  | 'delegados'
  | 'coordinacion'
  | 'ejecutivo'
  | 'soberano'
  | 'sectorial'
  | 'tecnico'
  | 'garantias'
  | 'militar'

/** [valor, justificación, confianza] */
export type Codigo = [number, string, Confianza]

export interface Organo {
  id: string
  n: string
  nivel: number
  tipo: TipoOrgano
  elegido_por?: string[]
  cima?: boolean
  decide?: string
  freq?: string
  desc?: string
}

export type Situacion = 'activa' | 'disuelta' | 'escindida' | 'burocratizada' | 'inactiva'
export type TipoFracaso =
  | 'escision'
  | 'colapso_escala'
  | 'captura_direccion'
  | 'institucionalizacion'
  | 'degeneracion'
  | 'colapso_economico'
  | 'represion'
  | 'fragmentacion'
  | 'desmovilizacion'

export interface Estado {
  situacion: Situacion
  /** El primero es el principal. */
  tipos: TipoFracaso[]
  /** Año del fracaso o del inicio de la deriva. */
  desde?: number
  causa: string
  /** Qué momento describe la ficha: en los casos fracasados, el de mayor tamaño o justo antes del fracaso. */
  momento_codificado: string
}

export interface Problema {
  t: 'democratico' | 'escalabilidad' | 'agilidad'
  x: string
}

export interface Org {
  id: string
  siglas: string
  nombre: string
  familia: Familia
  pais?: string
  fundacion?: number
  tamano?: [number, string, Confianza]
  /** Qué cuenta «tamano». Por defecto, afiliación. */
  tamano_unidad?: UnidadTamano
  /**
   * Crisis o reformas forzadas por el crecimiento: el tamaño en que la estructura dejó de funcionar.
   * Es la medida directa de escalabilidad; todavía no puntúa (hacen falta datos de más organizaciones).
   */
  crisis_crecimiento?: { anio: number; tamano?: number; x: string; fuente?: string }[]
  /** Sin este campo, la organización está activa. */
  estado?: Estado
  corriente?: string
  autogestionada?: boolean
  resumen?: string
  poder_formal?: string
  poder_real?: string
  organos: Organo[]
  reglas?: Partial<
    Record<'metodo' | 'ponderacion' | 'mandato' | 'cargos' | 'reforma' | 'minorias', string>
  >
  codigos: Record<string, Codigo>
  problemas?: Problema[]
  fuentes?: { t: string; u: string }[]
  confianza: Confianza
}
