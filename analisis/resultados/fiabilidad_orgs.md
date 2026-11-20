# Fiabilidad entre codificadores

Generado por `analisis/fiabilidad.py`. No editar a mano.

Restringido con `--orgs` a: cgt, fagor, mst, pah, psoe, syriza.

## Codificadores

| codificador | tipo | organizaciones | a ciegas |
|---|---|---|---|
| referencia | humano | 6 (todas) | — |
| agente-claude | ia (claude-opus-5-5) | 6 | sí |

Organizaciones con más de un codificador (6): cgt, fagor, mst, pah, psoe, syriza.

## Por variable

Alfa de Krippendorff ordinal; intervalo bootstrap del 95 % remuestreando organizaciones (2000 réplicas). Acuerdo sobre todos los pares de codificadores de cada organización. Umbrales habituales: α ≥ 0,800 buena, ≥ 0,667 tentativa.

| variable | grupo | n org | α ordinal | IC 95 % | acuerdo exacto | a ±1 | fiabilidad |
|---|---|---|---|---|---|---|---|
| Mandato imperativo (`mandato`) | CB | 6 | 0,762 | [0,06, 0,89] | 17 % | 100 % | tentativa |
| Revocabilidad (`revocabilidad`) | CB | 5 | 0,340 | [-0,50, 0,88] (1996 válidas) | 40 % | 100 % | insuficiente |
| Rotación (años máximos seguidos en el cargo de la cima) (`rotacion`) | CB | 6 | 0,935 | [0,39, 1,00] (1993 válidas) | 83 % | 100 % | buena |
| No profesionalización (`profesionalizacion`) | CB | 5 | 0,698 | [-0,65, 1,00] (1999 válidas) | 60 % | 80 % | tentativa |
| Elección de la dirección (`eleccion_direccion`) | CB | 6 | 0,896 | [0,19, 1,00] (1996 válidas) | 67 % | 100 % | buena |
| Agenda desde la base (`agenda_base`) | CB | 6 | 0,627 | [-0,14, 0,96] (1995 válidas) | 50 % | 83 % | insuficiente |
| Pluralismo interno (`pluralismo`) | CB | 6 | 0,858 | [0,06, 1,00] (1999 válidas) | 67 % | 100 % | buena |
| Autonomía de la base (`autonomia_base`) | CB | 6 | 0,871 | [0,24, 1,00] (1998 válidas) | 67 % | 100 % | buena |
| Brecha formal-real (`brecha_formal_real`) | ajuste | 6 | 0,342 | [-0,30, 0,58] | 0 % | 100 % | insuficiente |
| Regla de decisión (`regla_decision`) | CE | 6 | 0,764 | [0,00, 1,00] (1999 válidas) | 67 % | 100 % | tentativa |
| Capacidad ejecutiva (`capacidad_ejecutiva`) | CE | 6 | -0,123 | [-0,74, 0,69] (1996 válidas) | 50 % | 83 % | insuficiente |
| Estructura replicable (`estructura_federal`) | ES | 6 | 1,000 | [1,00, 1,00] (1965 válidas) | 100 % | 100 % | buena |
| Bajo coste de coordinación (`coste_coordinacion`) | ES | 6 | 0,764 | [-0,03, 1,00] (1999 válidas) | 67 % | 100 % | tentativa |

Agregados (cada par organización × variable es una unidad; el bootstrap remuestrea organizaciones):

| conjunto | unidades | α ordinal | IC 95 % | acuerdo exacto | a ±1 |
|---|---|---|---|---|---|
| las 13 manuales | 76 | 0,766 | [0,66, 0,86] | 57 % | 96 % |
| las 8 de control de base | 46 | 0,785 | [0,68, 0,85] | 57 % | 96 % |
| CB + brecha (las que entran en CB) | 52 | 0,748 | [0,65, 0,82] | 50 % | 96 % |

## Cada codificador frente a la referencia

Sesgo = media de (codificador − referencia): positivo si puntúa más alto.

| codificador | org | pares | exacto | a ±1 | sesgo medio | α ordinal (2 codificadores) |
|---|---|---|---|---|---|---|
| agente-claude | 6 | 76 | 57 % | 96 % | -0,05 | 0,766 |

## Índice de control de base (CB) con cada codificación

CB calculado con `app/lib/metrics.ts` y los pesos por defecto, sustituyendo en la ficha de referencia los 13 códigos manuales de cada codificador (organigrama, frecuencias y tamaño son los de la ficha). Posición = puesto en el ranking de CB de todas las fichas de referencia si solo esa organización usara esa codificación.

| org | CB referencia | CB agente-claude | Δ máx. | puesto referencia | puesto agente-claude |
|---|---|---|---|---|---|
| cgt | 40,6 | 53,4 | 12,8 | 8/24 | 7/24 |
| fagor | 19,5 | 31,7 | 12,2 | 21/24 | 14/24 |
| mst | 24,4 | 24,3 | 0,1 | 16/24 | 16/24 |
| pah | 54,1 | 49,8 | 4,3 | 5/24 | 6/24 |
| psoe | 19,1 | 22,9 | 3,8 | 22/24 | 18/24 |
| syriza | 22,3 | 24,3 | 2,0 | 19/24 | 17/24 |

agente-claude: diferencia media de CB 4,4 puntos; absoluta media 5,9 (escala 0-100).

## Desacuerdos de 2 o más puntos

### fagor · Capacidad ejecutiva (`capacidad_ejecutiva`) — diferencia 2

- **referencia: 2** (media). Ley 4/1993, art. 41.6: los poderes de la dirección-gerencia «solo podrán referirse al tráfico ordinario de la cooperativa»; la gestión y las demás facultades son del Consejo Rector (art. 40) y las decisiones de fondo, de la Asamblea (art. 31).
- **agente-claude: 4** (alta). Los administradores (Consejo Rector) tienen «en exclusiva la gestión y representación de la cooperativa» (Ley 4/1993 art. 40.1), y la Asamblea solo toma acuerdos obligatorios en materias que la ley no atribuye a otro órgano (art. 31.4), https://www.boe.es/buscar/act.php?id=BOE-A-2012-2011. Fuera de las materias reservadas (cuentas, estatutos, nombramientos), el Consejo decide sin ratificación.

### fagor · No profesionalización (`profesionalizacion`) — diferencia 2

- **referencia: 1** (media). Dirección profesional con poderes del Consejo Rector (Ley 4/1993, art. 41.6) y comités de nombramientos y retribuciones (Fuente: Basterretxea et al. 2022); el resto son socios trabajadores.
- **agente-claude: 3** (baja). Sin fuente verificable: la Ley 4/1993 art. 43 deja la retribución de los consejeros a estatutos o Asamblea (https://www.boe.es/buscar/act.php?id=BOE-A-2012-2011) y no he podido leer los estatutos de Fagor. El Consejo Rector lo forman socios trabajadores, pero la gestión diaria la lleva una gerencia profesional remunerada (director general, Alimarket, https://www.alimarket.es/electro/noticia_amp/101052/se-confirman-los-cambios-directivos-en-fagor). Entre 1 y 4.

### pah · Agenda desde la base (`agenda_base`) — diferencia 2

- **referencia: 4** (media). Criterios básicos: las asambleas estatales definen las líneas «a propuesta de las PAHs locales»; la Coordinadora Estatal propone el orden del día inicial y debe recoger e integrar las propuestas de modificación de las PAHs.
- **agente-claude: 2** (media). Criterios básicos: la CCE «será la encargada de proponer el orden del día inicial de cada asamblea estatal, y recoger e integrar propuestas de modificación al mismo por parte de las PAHs», que lo reciben con 2 semanas de antelación y pueden proponer cambios o temas nuevos. Entre 1 y 3: redacta la coordinadora, pero la base puede añadir temas y el texto dice «integrar». https://afectadosporlahipoteca.com/criterios-basicos-y-protocolos-pah/

