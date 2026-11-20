# Auditoría de fuentes de las fichas (noviembre de 2026)

Regla aplicada: todo dato debe tener una fuente verificable con URL (norma, documento de la organización o, como mínimo, prensa). Para cada ficha se buscó y se abrió la norma citada y se comprobó que el artículo dice lo que afirma la justificación. Si no se encontró fuente, el código pasa a confianza «baja» y su justificación empieza por «Sin fuente verificable:». No se ha borrado ningún código ni se han tocado organigramas. El valor de revocabilidad de Podemos (2) no se ha cambiado.

Comprobación de URL: todas las URL de `fuentes` responden 200 a una petición HTTP, salvo ISPI (403 a clientes automáticos; se lee con navegador y no hay copia en web.archive.org). Las de iww.org/constitution, psoe.es (transparencia y estatutos) y la memoria del PSOE bloquean a los clientes automáticos (403 o página de Incapsula), así que se sustituyeron por copias de web.archive.org o por el PDF directo.

Efecto en el control de base (API `/api/orgs.json`, antes → después):

| ficha | control de base | puesto | motivo |
|---|---|---|---|
| llog | 29,5 → 35,7 | 12 → 11 | Estatutos 2022: revocabilidad 2 → 3, elección de la dirección 2 → 4 |
| rojava | 29,7 → 28,0 | 11 → 12 | Contrato Social, art. 93: revocabilidad 3 → 2 |
| pah | 57,7 → 57,7 | 5 → 5 | Rotación 3 → 4 y elección 3 → 2: se compensan |

El resto de fichas no cambia de control de base.

## Anticapitalistas (`antic`)

- **Fuentes añadidas:** Organigrama (web), Documento político del IV Congreso (2026), Wikipedia — Izquierda Anticapitalista, Público (salida de Podemos, 2020). No hay estatutos públicos.
- **Discrepancias:** freq_soberano_meses 36 → 48 (III Congreso a finales de 2021 y IV en 2025-2026, unos cuatro años).
- **Sin fuente verificable (12):** mandato, revocabilidad, rotacion, profesionalizacion, eleccion_direccion, agenda_base, pluralismo (el «derecho de tendencia» no consta en ninguna fuente), brecha_formal_real, regla_decision, capacidad_ejecutiva, freq_intermedio_meses, niveles. También el tamaño.
- **URL caídas:** ninguna.

## CCOO (`ccoo`)

- **Fuentes añadidas:** CCOO — Estatutos 11º Congreso Confederal (2017); CCOO — Estatutos 13º Congreso Confederal (2025); Europa Press/Bolsamanía (un millón de afiliadas, 2025). Los artículos citados (11.1, 11.4, 12, 27, 29, 31, 32, 47 y 48) se han comprobado en las dos versiones.
- **Discrepancias:** profesionalizacion citaba el art. 31.c.3 para el «personal sindicalista retribuido»; ese artículo solo trata del personal técnico. El personal sindicalista está en el art. 48 y el personal laboral en el 47. El valor no cambia. rotacion, agenda_base, regla_decision y las frecuencias ahora citan el artículo (32.g, 29, 27.4, 27.b.1 y 29.b.1).
- **Sin fuente verificable:** ninguno. El umbral de «más de una liberada por cada mil» de profesionalizacion es una estimación.
- **URL caídas:** ninguna.

## CGT (`cgt`)

- **Fuentes añadidas:** El Salto — opinión de un militante (2025) para el tamaño. Las normas ya estaban (Estatutos y Reglamento de Congresos, XIX Congreso). Se han comprobado los arts. 45, 46, 49 y 50, el Reglamento (arts. 1, 6, 8, 21 y 27) y la disposición adicional tercera.
- **Discrepancias:** el tamaño decía «dato de la propia organización», pero no se encontró ninguna cifra oficial. La fuente es un artículo de opinión («más de 100.000 afiliadas»). La confianza pasa de media a baja.
- **Sin fuente verificable (1):** brecha_formal_real.
- **URL caídas:** ninguna.

## CNT (`cnt`)

- **Fuentes añadidas:** ninguna nueva; se ha precisado el título de la Normativa Orgánica (XII Congreso, 2022). Se han comprobado los arts. 2, 6, 55, 62, 65, 67, 68, 76-79, 93, 105 y 136.
- **Discrepancias:** regla_decision decía «consenso/refundición obligatoria en cada punto». Según los arts. 76-79, el acuerdo puede tomarse por consenso, por refundición o por votación, y la comisión de refundición solo se crea si alguien la pide. El valor se mantiene en 3 y la confianza baja de alta a media.
- **Sin fuente verificable (2):** freq_intermedio_meses (la Normativa no fija la periodicidad de los Plenos) y brecha_formal_real. También el tamaño.
- **URL caídas:** ninguna.

## co.bas (`cobas`)

- **Fuentes añadidas:** ninguna; se ha precisado el título de los Estatutos (V Congreso, 2023). Se han comprobado los arts. 6, 9, 10, 15, 16, 18 y 19.
- **Discrepancias:** profesionalizacion decía «sin liberados ni subvenciones (art. 10)», pero el art. 10 solo prohíbe los liberados. La consulta vinculante del código mandato está en el art. 6. Los valores no cambian.
- **Sin fuente verificable (2):** freq_intermedio_meses y brecha_formal_real. También el tamaño.
- **URL caídas:** ninguna.

## EZLN (`ezln`)

- **Fuentes añadidas:** Grupo Animal (2024). Estaba en la ficha del MST, pero trata del EZLN.
- **Discrepancias:** capacidad_ejecutiva y brecha_formal_real atribuían a la Comandancia los comunicados de la reestructuración de 2023. Las fuentes dicen «el EZLN». El valor no cambia.
- **Sin fuente verificable (8):** mandato, revocabilidad, rotacion, profesionalizacion, pluralismo, regla_decision, freq_soberano_meses, freq_intermedio_meses. También el tamaño. No se encontró ningún comunicado concreto de Enlace Zapatista que regule cargos o revocación.
- **URL caídas:** ninguna.

## Sindicato de Inquilinas de Madrid (`inqmad`)

- **Fuentes añadidas:** Organigrama detallado (PDF, noviembre de 2025). Los estatutos y el Reglamento de Régimen Interno (2026) no son públicos.
- **Discrepancias:** ninguna. profesionalizacion cita ahora el resumen de la Asamblea 2026 (subida salarial de las compañeras remuneradas).
- **Sin fuente verificable (5):** mandato, revocabilidad, rotacion, pluralismo, regla_decision.
- **URL caídas:** ninguna.

## IWW (`iww`)

- **Fuentes añadidas:** IWW — Constitution, Bylaws and International Guiding Principles (2025, PDF). iww.org/constitution/ responde 403 a clientes automáticos y se ha sustituido por su copia de web.archive.org. Se han comprobado los arts. III (sec. 2-5), VI (sec. 1 y 3e) y IX (sec. 2-3) y el art. VIII de los Bylaws.
- **Discrepancias:** profesionalizacion decía «el GST es retribuido», pero la norma solo dice que la GEB fija los salarios del personal. rotacion: el límite de tres mandatos de un año tiene una excepción si no hay candidaturas suficientes. El valor (4) se mantiene, pero queda anotado.
- **Sin fuente verificable (2):** brecha_formal_real (no se cita ninguna fuente secundaria) y freq_intermedio_meses. También el tamaño.
- **URL caídas:** iww.org/constitution/ (403), sustituida por la copia de archive.org.

## Sindicat de Llogateres (`llog`)

- **Fuentes añadidas:** Estatuts (2022, copia diligenciada del Registre d'associacions; PDF escaneado, leído página a página); página de Transparència (espais de governança).
- **Discrepancias (cambian valor):**
  - revocabilidad 2 → 3: la Asamblea General de todas las afiliadas separa a la Junta (arts. 9.b y 15.2.d); fuera de la ordinaria hace falta el 10 % (arts. 10.2 y 12.2).
  - eleccion_direccion 2 → 4: la Asamblea General elige a la Junta (art. 14.2) y vota cada año el equipo de portavoces (Transparència).
  - regla_decision 3 → 4: mayoría simple (arts. 13.2 y 18.3).
  - capacidad_ejecutiva 2 → 3: la Junta resuelve provisionalmente y da cuenta a la Asamblea (art. 16.m).
  - freq_soberano_meses 3 → 12: Asamblea ordinaria al menos anual (art. 10.1).
  - Sube la confianza de rotación, profesionalización, agenda y pluralismo (Estatuts, arts. 11-16).
- **Sin fuente verificable (2):** mandato y freq_intermedio_meses. También el tamaño. La permanencia de la portavocía durante años (en brecha_formal_real) tampoco tiene fuente.
- **URL caídas:** ninguna.

## MONDRAGON (`mondragon`)

- **Fuentes añadidas:** Ley 11/2019 de Cooperativas de Euskadi (BOE, texto consolidado); MONDRAGON — Informe anual 2025.
- **Discrepancias:** tamaño 70.000 → 71.400 (plantilla media de 71.415 en 2025). La parte no socia no consta. revocabilidad cita ahora el art. 46.2 de la Ley 11/2019, y regla_decision y freq_soberano citan los arts. 38 y 34. Bakaikoa et al. (2004), citado en rotación, no está localizado.
- **Sin fuente verificable (9):** mandato, rotacion, profesionalizacion, eleccion_direccion, agenda_base, pluralismo, brecha_formal_real (las «fuentes académicas» no están en la ficha), capacidad_ejecutiva, freq_intermedio_meses.
- **URL caídas:** ninguna.

## MST (`mst`)

- **Fuentes añadidas:** ninguna; se ha reutilizado «Quem somos». La fuente «Tricontinental» citada para los mandatos de dos años no está localizada.
- **Discrepancias:** freq_soberano_meses 72 → 60 (Congresos «en media cada cinco años» según el MST). El tamaño cita ahora la cifra del MST (450.000 familias, sin contar las acampadas).
- **Sin fuente verificable (9):** mandato, revocabilidad, rotacion, profesionalizacion, agenda_base, pluralismo, brecha_formal_real, capacidad_ejecutiva, freq_intermedio_meses.
- **URL caídas:** ninguna.

## PAH (`pah`)

- **Fuentes añadidas:** PAH — Criterios básicos de funcionamiento (líneas rojas, versión 2 de 2022), en la web oficial. El enlace al PDF de esa página devuelve 404; el texto está en la propia página.
- **Discrepancias (cambian valor):**
  - rotacion 3 → 4: la Comisión de Coordinación Estatal tiene mandatos de 1 + 1 años como máximo.
  - eleccion_direccion 3 → 2: la Coordinadora la componen 3 personas por cada coordinadora autonómica y 1 por cada comisión; no la elige el encuentro estatal.
  - regla_decision 1 → 2: consenso, con votación por mayoría como último recurso y 2/3 para las grandes decisiones.
  - capacidad_ejecutiva 0 → 3: la Coordinadora Estatal trata lo urgente y la asamblea estatal lo ratifica después.
  - freq_intermedio_meses 6 → 4: asambleas estatales cada 4 meses como máximo.
- **Sin fuente verificable (3):** revocabilidad, brecha_formal_real, freq_soberano_meses (no consta que la asamblea local sea semanal). También el tamaño.
- **URL caídas:** ninguna (el PDF enlazado desde la página da 404, pero no estaba en `fuentes`).

## PCE (`pce`)

- **Fuentes añadidas:** PCE — Estatutos XX Congreso (2018). Se han comprobado los arts. 18.7, 19.3, 20.2, 23, 26, 27, 53, 55, 59-66 y 80; todos dicen lo que afirman las justificaciones. Las cifras de 500 delegados y 56/44 están en Público, y las de 7.713 afiliados y 54/46 en El Común.
- **Discrepancias:** ninguna. regla_decision y freq_intermedio citan ahora los arts. 18.7 y 62.1.
- **Sin fuente verificable:** ninguno.
- **URL caídas:** ninguna.

## PCTE (`pcte`)

- **Fuentes añadidas:** PCTE — Conócenos (centralismo democrático). Los estatutos, modificados en el III Congreso (2025), no son públicos; la Resolución Política no contiene reglas orgánicas. La URL de Wikipedia se ha actualizado a la que no redirige.
- **Discrepancias:** ninguna verificable.
- **Sin fuente verificable (14):** todos los códigos salvo estructura_federal y coste_coordinacion. También el tamaño.
- **URL caídas:** ninguna.

## Podemos (`podemos`)

- **Fuentes añadidas:** Podemos — Documento Ético V ACE (2025); Resultados de la V ACE (2025); Público (salida de Anticapitalistas, 2020); 20 Minutos (Errejón y Más Madrid, 2019). Se han comprobado los arts. 22, 23, 25 y 26 del Documento Organizativo y el sistema DesBorda del Reglamento.
- **Discrepancias:** eleccion_direccion hablaba de «listas plancha»; el Reglamento establece listas abiertas con DesBorda, con la candidata a la SG vinculada a una lista. El valor no cambia. rotacion: el Documento Ético, antes «no leído», confirma 8 años prorrogables a 12 y más con consulta, y la confianza sube de media a alta. brecha_formal_real ya no afirma que «el revocatorio nunca se ha usado», porque no hay fuente. El valor de revocabilidad (2) no se ha tocado.
- **Sin fuente verificable:** ninguno.
- **URL caídas:** ninguna.

## PSOE (`psoe`)

- **Fuentes añadidas:** PSOE — Estatutos Federales 41º Congreso (2024), copia de web.archive.org (psoe.es bloquea a clientes automáticos); PSOE — Memoria anual 2025 (copia de archive.org). La página de transparencia se ha sustituido por su copia de archive.org.
- **Discrepancias:**
  - revocabilidad citaba el art. 5; la revocación está en el art. 6.1.a. El valor no cambia.
  - freq_intermedio_meses 4 → 6: el art. 28.1 establece que el Comité Federal se reúne al menos dos veces al año.
  - tamaño 170.000 → 147.648 (afiliados a finales de 2025 según la memoria; el valor anterior era una estimación por censos de primarias).
  - rotacion: en el 41º Congreso el límite de mandatos pasa de la disposición adicional 3ª al art. 3.9, con el mismo contenido.
- **Sin fuente verificable (1):** brecha_formal_real (decía «estimación con prensa», pero no cita prensa).
- **URL caídas:** psoe.es responde con una página de bloqueo (Incapsula) a clientes automáticos; sustituida por la copia de archive.org.

## DAANES / Rojava (`rojava`)

- **Fuentes añadidas:** ninguna nueva; se ha precisado el título del Contrato Social (2023, traducción del RIC). Se han comprobado los arts. 43, 47, 75-78, 92, 93 y 121-126.
- **Discrepancias:**
  - revocabilidad 3 → 2: la cima (la copresidencia del Consejo Ejecutivo) la revoca el Consejo Democrático de los Pueblos, que la elige (art. 93). La revocación desde la base (art. 76) es la de las comunas.
  - mandato: el texto ya está leído entero y la confianza sube de baja a media.
  - brecha_formal_real: el informe de Carnegie (2019) citado no está localizado; esa parte queda sin fuente. Lo demás se apoya en Wikipedia (elecciones aplazadas) y en ISPI.
  - freq_soberano_meses: la norma fija ciclos de dos años; el valor (60) refleja la práctica y queda anotado.
- **Sin fuente verificable (2):** profesionalizacion (la cifra de 50.000 empleados no aparece en ninguna fuente) y freq_intermedio_meses.
- **URL caídas:** ISPI responde 403 a peticiones automáticas, pero se lee con navegador (se ha comprobado el contenido). No hay copia en web.archive.org.

## Solidaridad Obrera (`solio`)

- **Fuentes añadidas:** ninguna; la URL de Wikipedia se ha actualizado (redirigía). Las citas («no existe decisión delegada», «todos los cargos son revocables», «rotativos siempre que haya posibilidades») se han comprobado en Wikipedia y Portaloaca.
- **Discrepancias:** revocabilidad (4): la fuente dice que los cargos son revocables, pero no quién los revoca ni cuándo. La confianza baja de media a baja.
- **Sin fuente verificable (3):** profesionalizacion, regla_decision, freq_intermedio_meses. No se encontraron los estatutos.
- **URL caídas:** ninguna.

## Zanón / FaSinPat (`zanon`)

- **Fuentes añadidas:** ninguna. Wikipedia solo sostiene el tamaño (unos 400) y que es una sola unidad. El artículo de La Nación que cita Wikipedia está caído (hay copia en archive.org), pero no describe el gobierno de la fábrica.
- **Discrepancias:** ninguna verificable.
- **Sin fuente verificable (14):** todos los códigos salvo estructura_federal y coste_coordinacion.
- **URL caídas:** ninguna.

## Otros campos sin fuente (problemas, poder_real)

No llevan confianza, así que no se han marcado. Quedan sin fuente en la ficha:

- CNT: las escisiones de 1979-84 y 2018.
- MONDRAGON: Fagor (2013) y la salida de Ulma y Orona (2022).
- PSOE: el poder_real (control de listas y del Gobierno).
- PCTE: el poder_real (el CC saliente propone las tesis y las candidaturas).
- MST: las jornadas de abril.
- EZLN y Rojava: el «doble poder» descrito en los problemas, que se apoya en parte en fuentes citadas.
