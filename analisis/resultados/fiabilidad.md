# Fiabilidad entre codificadores

Generado por `analisis/fiabilidad.py`. No editar a mano.

## Codificadores

| codificador | tipo | organizaciones | a ciegas |
|---|---|---|---|
| referencia | humano | 24 (todas) | — |
| agente-claude | ia (claude-opus-5-5) | 6 | sí |

Organizaciones con más de un codificador (6): ccoo, cnt, iww, mondragon, podemos, rojava.

## Por variable

Alfa de Krippendorff ordinal; intervalo bootstrap del 95 % remuestreando organizaciones (2000 réplicas). Acuerdo sobre todos los pares de codificadores de cada organización. Umbrales habituales: α ≥ 0,800 buena, ≥ 0,667 tentativa.

| variable | grupo | n org | α ordinal | IC 95 % | acuerdo exacto | a ±1 | fiabilidad |
|---|---|---|---|---|---|---|---|
| Mandato imperativo (`mandato`) | CB | 6 | 0,778 | [-0,03, 0,93] | 33 % | 100 % | tentativa |
| Revocabilidad (`revocabilidad`) | CB | 6 | 0,644 | [-0,30, 0,97] | 50 % | 100 % | insuficiente |
| Rotación (años máximos seguidos en el cargo de la cima) (`rotacion`) | CB | 6 | 0,932 | [0,39, 1,00] (1969 válidas) | 83 % | 100 % | buena |
| No profesionalización (`profesionalizacion`) | CB | 6 | 0,899 | [0,26, 1,00] (1997 válidas) | 67 % | 100 % | buena |
| Elección de la dirección (`eleccion_direccion`) | CB | 6 | 1,000 | [1,00, 1,00] (1997 válidas) | 100 % | 100 % | buena |
| Agenda desde la base (`agenda_base`) | CB | 6 | 0,970 | [0,65, 1,00] (1978 válidas) | 83 % | 100 % | buena |
| Pluralismo interno (`pluralismo`) | CB | 6 | 0,663 | [-0,10, 1,00] (1998 válidas) | 67 % | 100 % | insuficiente |
| Autonomía de la base (`autonomia_base`) | CB | 6 | 1,000 | [1,00, 1,00] (1970 válidas) | 100 % | 100 % | buena |
| Brecha formal-real (`brecha_formal_real`) | ajuste | 6 | 0,870 | [0,19, 1,00] (1996 válidas) | 67 % | 100 % | buena |
| Regla de decisión (`regla_decision`) | CE | 6 | 0,963 | [0,54, 1,00] (1820 válidas) | 83 % | 100 % | buena |
| Capacidad ejecutiva (`capacidad_ejecutiva`) | CE | 6 | 0,535 | [-0,38, 0,98] (1971 válidas) | 50 % | 100 % | insuficiente |
| Estructura replicable (`estructura_federal`) | ES | 6 | 0,663 | [-0,10, 1,00] (1994 válidas) | 67 % | 100 % | insuficiente |
| Bajo coste de coordinación (`coste_coordinacion`) | ES | 6 | 0,711 | [-0,22, 1,00] (1972 válidas) | 83 % | 83 % | tentativa |

Agregados (cada par organización × variable es una unidad; el bootstrap remuestrea organizaciones):

| conjunto | unidades | α ordinal | IC 95 % | acuerdo exacto | a ±1 |
|---|---|---|---|---|---|
| las 13 manuales | 78 | 0,883 | [0,79, 0,94] | 72 % | 99 % |
| las 8 de control de base | 48 | 0,906 | [0,80, 0,93] | 73 % | 100 % |
| CB + brecha (las que entran en CB) | 54 | 0,902 | [0,83, 0,94] | 72 % | 100 % |

## Cada codificador frente a la referencia

Sesgo = media de (codificador − referencia): positivo si puntúa más alto.

| codificador | org | pares | exacto | a ±1 | sesgo medio | α ordinal (2 codificadores) |
|---|---|---|---|---|---|---|
| agente-claude | 6 | 78 | 72 % | 99 % | 0,01 | 0,883 |

## Índice de control de base (CB) con cada codificación

CB calculado con `app/lib/metrics.ts` y los pesos por defecto, sustituyendo en la ficha de referencia los 13 códigos manuales de cada codificador (organigrama, frecuencias y tamaño son los de la ficha). Posición = puesto en el ranking de CB de todas las fichas de referencia si solo esa organización usara esa codificación.

| org | CB referencia | CB agente-claude | Δ máx. | puesto referencia | puesto agente-claude |
|---|---|---|---|---|---|
| ccoo | 25,1 | 20,8 | 4,2 | 15/24 | 19/24 |
| cnt | 80,2 | 77,8 | 2,4 | 1/24 | 1/24 |
| iww | 58,3 | 59,4 | 1,0 | 4/24 | 3/24 |
| mondragon | 21,0 | 20,9 | 0,1 | 19/24 | 19/24 |
| podemos | 16,7 | 23,4 | 6,8 | 23/24 | 18/24 |
| rojava | 28,0 | 26,6 | 1,4 | 14/24 | 14/24 |

agente-claude: diferencia media de CB -0,1 puntos; absoluta media 2,7 (escala 0-100).

## Desacuerdos de 2 o más puntos

### rojava · Bajo coste de coordinación (`coste_coordinacion`) — diferencia 2

- **referencia: 2** (baja). Muchos niveles de consejos.
- **agente-claude: 4** (media). Contrato Social 2023 (https://rojavainformationcenter.org/2023/12/aanes-social-contract-2023-edition), arts. 78-96: consejos representativos elegidos cada dos años, con consejos ejecutivos y comisiones permanentes en cada nivel; solo la comuna funciona como asamblea directa (art. 76). ISPI 2026 (https://www.ispionline.it/en/publication/from-autonomy-to-integration-northeastern-syria-after-assad-239443) cifra en unas 50.000 las personas empleadas por la administración. Entre 3 y 4.

