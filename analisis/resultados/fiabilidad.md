# Fiabilidad entre codificadores

Generado por `analisis/fiabilidad.py`. No editar a mano.

## Codificadores

| codificador | tipo | organizaciones | a ciegas |
|---|---|---|---|
| referencia | humano | 24 (todas) | — |
| agente-claude | ia (claude-opus-5-5) | 12 | sí |

Organizaciones con más de un codificador (12): ccoo, cgt, cnt, fagor, iww, mondragon, mst, pah, podemos, psoe, rojava, syriza.

## Por variable

Alfa de Krippendorff ordinal; intervalo bootstrap del 95 % remuestreando organizaciones (2000 réplicas). Acuerdo sobre todos los pares de codificadores de cada organización. Umbrales habituales: α ≥ 0,800 buena, ≥ 0,667 tentativa.

| variable | grupo | n org | α ordinal | IC 95 % | acuerdo exacto | a ±1 | fiabilidad |
|---|---|---|---|---|---|---|---|
| Mandato imperativo (`mandato`) | CB | 12 | 0,761 | [0,26, 0,87] | 25 % | 100 % | tentativa |
| Revocabilidad (`revocabilidad`) | CB | 11 | 0,534 | [-0,11, 0,88] | 55 % | 91 % | insuficiente |
| Rotación (años máximos seguidos en el cargo de la cima) (`rotacion`) | CB | 12 | 0,954 | [0,75, 1,00] | 83 % | 100 % | buena |
| No profesionalización (`profesionalizacion`) | CB | 11 | 0,828 | [0,33, 0,99] | 64 % | 91 % | buena |
| Elección de la dirección (`eleccion_direccion`) | CB | 12 | 0,950 | [0,75, 1,00] | 83 % | 100 % | buena |
| Agenda desde la base (`agenda_base`) | CB | 12 | 0,817 | [0,47, 0,99] | 67 % | 92 % | buena |
| Pluralismo interno (`pluralismo`) | CB | 12 | 0,858 | [0,44, 1,00] | 75 % | 100 % | buena |
| Autonomía de la base (`autonomia_base`) | CB | 12 | 0,909 | [0,64, 1,00] | 83 % | 100 % | buena |
| Brecha formal-real (`brecha_formal_real`) | ajuste | 12 | 0,628 | [0,13, 0,82] | 33 % | 100 % | insuficiente |
| Regla de decisión (`regla_decision`) | CE | 12 | 0,835 | [0,47, 1,00] (1999 válidas) | 75 % | 100 % | buena |
| Capacidad ejecutiva (`capacidad_ejecutiva`) | CE | 12 | 0,215 | [-0,41, 0,66] | 42 % | 92 % | insuficiente |
| Estructura replicable (`estructura_federal`) | ES | 12 | 0,753 | [0,29, 1,00] | 75 % | 100 % | tentativa |
| Bajo coste de coordinación (`coste_coordinacion`) | ES | 12 | 0,798 | [0,33, 1,00] | 75 % | 100 % | tentativa |

Agregados (cada par organización × variable es una unidad; el bootstrap remuestrea organizaciones):

| conjunto | unidades | α ordinal | IC 95 % | acuerdo exacto | a ±1 |
|---|---|---|---|---|---|
| las 13 manuales | 154 | 0,834 | [0,76, 0,90] | 64 % | 97 % |
| las 8 de control de base | 94 | 0,844 | [0,75, 0,90] | 67 % | 97 % |
| CB + brecha (las que entran en CB) | 106 | 0,828 | [0,75, 0,89] | 63 % | 97 % |

## Cada codificador frente a la referencia

Sesgo = media de (codificador − referencia): positivo si puntúa más alto.

| codificador | org | pares | exacto | a ±1 | sesgo medio | α ordinal (2 codificadores) |
|---|---|---|---|---|---|---|
| agente-claude | 12 | 154 | 64 % | 97 % | 0,01 | 0,834 |

## Índice de control de base (CB) con cada codificación

CB calculado con `app/lib/metrics.ts` y los pesos por defecto, sustituyendo en la ficha de referencia los 13 códigos manuales de cada codificador (organigrama, frecuencias y tamaño son los de la ficha). Posición = puesto en el ranking de CB de todas las fichas de referencia si solo esa organización usara esa codificación.

| org | CB referencia | CB agente-claude | Δ máx. | puesto referencia | puesto agente-claude |
|---|---|---|---|---|---|
| ccoo | 22,9 | 20,8 | 2,1 | 17/24 | 20/24 |
| cgt | 40,6 | 53,4 | 12,8 | 8/24 | 7/24 |
| cnt | 80,2 | 77,8 | 2,4 | 1/24 | 1/24 |
| fagor | 19,5 | 31,7 | 12,2 | 21/24 | 14/24 |
| iww | 58,3 | 59,4 | 1,0 | 4/24 | 3/24 |
| mondragon | 21,0 | 20,9 | 0,1 | 20/24 | 20/24 |
| mst | 24,4 | 24,3 | 0,1 | 16/24 | 16/24 |
| pah | 54,1 | 49,8 | 4,3 | 5/24 | 6/24 |
| podemos | 13,2 | 23,4 | 10,2 | 23/24 | 17/24 |
| psoe | 19,1 | 22,9 | 3,8 | 22/24 | 18/24 |
| rojava | 28,0 | 26,6 | 1,4 | 14/24 | 15/24 |
| syriza | 22,3 | 24,3 | 2,0 | 19/24 | 17/24 |

agente-claude: diferencia media de CB 2,6 puntos; absoluta media 4,4 (escala 0-100).

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

### podemos · Revocabilidad (`revocabilidad`) — diferencia 2

- **referencia: 1** (alta). Documento Organizativo V ACE, art. 26: revoca la Asamblea Ciudadana (toda la base), pero con trámite reforzado: no antes de 18 meses desde la elección, a petición del 25 % de las inscritas (o de la SG o la mayoría absoluta del Consejo Ciudadano) y una sola consulta revocatoria por mandato. Con el anclaje nuevo cualquiera de estas condiciones da 1, sin la regla ad hoc anterior (base = 3, menos 1).
- **agente-claude: 3** (alta). La Secretaría General y el CCE pueden revocarse por consulta vinculante a la Asamblea Ciudadana (todas las inscritas) que los eligió, pero no antes de 18 meses desde la elección, a convocatoria de la SG, la mayoría absoluta del CCE o el 25 % de las inscritas, y nadie puede someterse a una segunda consulta revocatoria en el mismo mandato (Documento Organizativo V ACE 2025, art. 26; art. 21 para el nivel autonómico, https://podemos.info/wp-content/uploads/2025/04/Documento-Organizativo-V-ACE.pdf). Entre 1 y 3: el órgano que elige es la propia base, así que encaja en «por la base, con trámite», aunque el trámite es muy reforzado (plazo, 25 %, un solo intento).

