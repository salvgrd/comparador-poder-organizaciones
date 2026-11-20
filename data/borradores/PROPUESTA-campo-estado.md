# Propuesta: campo `estado` para organizaciones disueltas, escindidas o burocratizadas

Las fichas de `data/borradores/` ya lo incluyen. `validarOrg` ignora campos desconocidos, así que no rompen
nada si se mueven a `data/orgs/`, pero el tipo `Org` (app/lib/types.ts) no lo declara todavía.

```ts
export type TipoFracaso =
  | 'escision'             // ruptura en dos o más organizaciones
  | 'colapso_escala'       // la estructura deja de funcionar al crecer (asamblea inmanejable, desvinculación)
  | 'captura_direccion'    // la cúpula decide contra los órganos o la base
  | 'institucionalizacion' // de movimiento a partido/sindicato convencional, absorción por el Estado
  | 'degeneracion'         // cooperativa: crece con asalariados no socios o gerencia que domina
  | 'colapso_economico'    // quiebra
  | 'represion'            // ilegalización, desalojo, infiltración
  | 'fragmentacion'        // se disuelve en proyectos autónomos sin escisión explícita
  | 'desmovilizacion'      // pérdida gradual de participantes

export interface Estado {
  /** 'activa' por defecto si falta el campo. */
  situacion: 'activa' | 'disuelta' | 'escindida' | 'burocratizada' | 'inactiva'
  tipos: TipoFracaso[]        // puede haber varios; el primero es el principal
  desde?: number              // año del fracaso o del inicio de la deriva
  causa: string               // explicación breve, con lo que es discutido en la literatura
  /** Qué momento describe la ficha: para casos fracasados, el de mayor tamaño o justo antes del fracaso. */
  momento_codificado: string
}

// en Org:
estado?: Estado
```

Notas:

- `burocratizada` cubre organizaciones que siguen existiendo pero perdieron el control de base (PT, Syriza,
  Solidarność). Es una valoración, no un hecho: conviene que la `causa` diga quién lo sostiene.
- `momento_codificado` es clave para no mezclar estructuras: `cnt1979` y `cnt` son la misma organización en
  dos momentos. Para análisis de supervivencia haría falta además un campo para enlazarlas
  (p. ej. `sucesoras: ['cnt', 'cgt']`).
- Complementa a `crisis_crecimiento`, que ya registra los tamaños en que la estructura dejó de funcionar.
  `estado` dice cómo acabó.
- En la interfaz bastaría con una etiqueta en la tarjeta («disuelta en 2013») y un filtro «incluir casos
  fracasados» en el panorama, para comparar los índices con y sin sesgo de supervivencia.
