# Fiabilidad entre codificadores

Generado por `analisis/fiabilidad.py`. No editar a mano.

## Codificadores

| codificador | tipo | organizaciones | a ciegas |
|---|---|---|---|
| referencia | humano | 19 (todas) | — |
| agente-claude | ia (claude-opus-5-5) | 6 | sí |

Organizaciones con más de un codificador (6): ccoo, cnt, iww, mondragon, podemos, rojava.

## Por variable

Alfa de Krippendorff ordinal; intervalo bootstrap del 95 % remuestreando organizaciones (2000 réplicas). Acuerdo sobre todos los pares de codificadores de cada organización. Umbrales habituales: α ≥ 0,800 buena, ≥ 0,667 tentativa.

| variable | grupo | n org | α ordinal | IC 95 % | acuerdo exacto | a ±1 | fiabilidad |
|---|---|---|---|---|---|---|---|
| Mandato imperativo (`mandato`) | CB | 6 | 0,937 | [0,39, 1,00] | 83 % | 100 % | buena |
| Revocabilidad (`revocabilidad`) | CB | 6 | 0,935 | [0,39, 1,00] (1995 válidas) | 83 % | 100 % | buena |
| Rotación (años máximos seguidos en el cargo de la cima) (`rotacion`) | CB | 6 | 0,932 | [0,39, 1,00] (1969 válidas) | 83 % | 100 % | buena |
| No profesionalización (`profesionalizacion`) | CB | 6 | 0,937 | [0,39, 1,00] (1997 válidas) | 83 % | 100 % | buena |
| Elección de la dirección (`eleccion_direccion`) | CB | 6 | 1,000 | [1,00, 1,00] (1997 válidas) | 100 % | 100 % | buena |
| Agenda desde la base (`agenda_base`) | CB | 6 | 0,970 | [0,65, 1,00] (1978 válidas) | 83 % | 100 % | buena |
| Pluralismo interno (`pluralismo`) | CB | 6 | 0,686 | [-0,10, 1,00] (1972 válidas) | 83 % | 100 % | tentativa |
| Autonomía de la base (`autonomia_base`) | CB | 6 | 0,871 | [-0,10, 1,00] (1970 válidas) | 83 % | 100 % | buena |
| Brecha formal-real (`brecha_formal_real`) | ajuste | 6 | 0,746 | [-0,01, 0,94] | 33 % | 100 % | tentativa |
| Regla de decisión (`regla_decision`) | CE | 6 | 0,696 | [-0,14, 1,00] (1972 válidas) | 67 % | 100 % | tentativa |
| Capacidad ejecutiva (`capacidad_ejecutiva`) | CE | 6 | 1,000 | [1,00, 1,00] (1331 válidas) | 100 % | 100 % | buena |
| Estructura replicable (`estructura_federal`) | ES | 6 | 0,867 | [-0,10, 1,00] (1974 válidas) | 83 % | 100 % | buena |
| Bajo coste de coordinación (`coste_coordinacion`) | ES | 6 | 0,970 | [0,65, 1,00] (1972 válidas) | 83 % | 100 % | buena |

Agregados (cada par organización × variable es una unidad; el bootstrap remuestrea organizaciones):

| conjunto | unidades | α ordinal | IC 95 % | acuerdo exacto | a ±1 |
|---|---|---|---|---|---|
| las 13 manuales | 78 | 0,920 | [0,86, 0,96] | 81 % | 100 % |
| las 8 de control de base | 48 | 0,944 | [0,86, 0,98] | 85 % | 100 % |
| CB + brecha (las que entran en CB) | 54 | 0,921 | [0,87, 0,96] | 80 % | 100 % |

## Cada codificador frente a la referencia

Sesgo = media de (codificador − referencia): positivo si puntúa más alto.

| codificador | org | pares | exacto | a ±1 | sesgo medio | α ordinal (2 codificadores) |
|---|---|---|---|---|---|---|
| agente-claude | 6 | 78 | 81 % | 100 % | -0,04 | 0,920 |

## Índice de control de base (CB) con cada codificación

CB calculado con `app/lib/metrics.ts` y los pesos por defecto, sustituyendo en la ficha de referencia los 13 códigos manuales de cada codificador (organigrama, frecuencias y tamaño son los de la ficha). Posición = puesto en el ranking de CB de todas las fichas de referencia si solo esa organización usara esa codificación.

| org | CB referencia | CB agente-claude | Δ máx. | puesto referencia | puesto agente-claude |
|---|---|---|---|---|---|
| ccoo | 25,1 | 25,1 | 0,0 | 13/19 | 13/19 |
| cnt | 80,2 | 75,3 | 4,9 | 1/19 | 1/19 |
| iww | 58,3 | 70,5 | 12,2 | 4/19 | 2/19 |
| mondragon | 21,0 | 25,2 | 4,2 | 16/19 | 13/19 |
| podemos | 14,6 | 22,6 | 8,0 | 18/19 | 16/19 |
| rojava | 29,7 | 33,2 | 3,5 | 11/19 | 11/19 |

agente-claude: diferencia media de CB 3,8 puntos; absoluta media 5,5 (escala 0-100).

## Desacuerdos de 2 o más puntos

Ninguno.
