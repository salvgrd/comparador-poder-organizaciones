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
