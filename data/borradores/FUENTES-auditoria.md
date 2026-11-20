# Auditoría de fuentes de las fichas borrador (noviembre de 2026)

Regla: cada afirmación debe salir de una fuente con URL que se haya abierto y que lo diga. Las variables de estructura se codifican solo según estatutos, normas vinculantes o, en movimientos sin estatutos, acuerdos de asamblea y documentos de funcionamiento (REGLA_FORMAL). La práctica va en `brecha_formal_real`.

Convención de cita: las fichas de `data/orgs/` citan artículos entre paréntesis («(art. 50)»). Aquí se sigue igual: «(Estatuto 2001, art. 31)», y para fuentes no normativas «(Fuente: <título corto>)». El título corto es el prefijo del campo `t` de cada entrada de `fuentes`.

Todas las URL se comprobaron con una petición y su contenido se leyó en esta sesión. Las que daban 403 o 404 se cambiaron por copias de web.archive.org. Al final de la sesión web.archive.org respondía con 429/503 por exceso de peticiones; esas copias se habían descargado y leído antes con código 200.

`descartados/` no se ha tocado.

## Estatutos buscados (tarea 1)

- **Estatuto de NSZZ Solidarność de 1980: encontrado y leído.** Texto íntegro del estatuto del 22-IX-1980 en la Wszechnica Solidarności (copia en web.archive.org). **El texto enmendado por el I Congreso (septiembre-octubre de 1981) no se ha encontrado como texto.** Solo hay escaneos sin orden del folleto del BIPS («Statut. Uchwała programowa…», 5 páginas de miniaturas) y no se pueden leer sin OCR. Los cambios de 1981 se toman de fuentes secundarias: Encyklopedia Solidarności e historia.org.pl. Por eso varios códigos quedan con confianza media.
- **Estatuto do PT de 2001: encontrado y leído.** Texto aprobado por el Directorio Nacional el 11-III-2001, en la Political Party Database. No está en pt.org.br ni en la FPA en abierto.

## Solidarność (`solidarnosc`)

Fuentes añadidas:
- Estatuto 1980 (Wszechnica Solidarności, web.archive.org)
- ES, I KZD y ES, KKP/KK: entradas de la Encyklopedia Solidarności (web.archive.org, porque encysol.pl daba 503)
- ES, Kalendarium III-1981 (encysol.pl, PDF)
- Historia.org.pl, I KZD
- IPN, KKW
- Reseña de Ost en Perspectives on Politics (sustituye a un enlace de búsqueda de Open Library)

Fuentes quitadas: la portada genérica de encysol.pl, la ficha del libro de estenogramas del IPN (no se usaba para nada), la búsqueda de Open Library y la Wikipedia de la NCC.

Recodificado con artículos del estatuto de 1980:
- mandato 0→3: § 11.3, derecho a fijar instrucciones a los delegados.
- revocabilidad 2→2: § 9.7, ahora con artículo.
- rotación 1→4: § 9.5, dos mandatos seguidos de 2 años.
- capacidad_ejecutiva 3→2: § 19.2, el Presidium solo ejecuta.
- freq_soberano 24→12: el congreso pasa a ser anual en la reforma de 1981.
- Además niveles, regla_decision, autonomía, estructura y coste, con artículos.
- Confianza: rotación, revocabilidad y mandato suben de baja a media (no a alta, porque falta el texto de 1981).

Afirmaciones quitadas o corregidas:
- «Para que el gobierno no pudiera fragmentarla»: sin fuente.
- «La cifra de 3 millones» en la crisis de 1980: sin fuente.
- «Intelectuales católicos y del KOR»: se sustituye por los nombres que da la fuente.
- La dimisión de Gwiazda tras el acuerdo de Varsovia: no aparece. La fuente dice que dimitió Modzelewski y se corrige.
- «Apoyó la terapia de choque»: sin fuente.
- «Sin tiempo de formar cuadros»: sin fuente.
- La frecuencia «cada pocas semanas» de la Comisión Nacional: sin fuente.

Corregido: el I Congreso «enmienda» el estatuto (no lo «aprueba»), y el presidente se elegía por la Comisión Nacional en 1980 y por el congreso desde 1981.

Sin fuente: freq_intermedio_meses (baja) y profesionalizacion (baja, sin datos de liberados).

## PT (`pt`)

Fuentes añadidas:
- Estatuto 2001 (Political Party Database)

Fuentes quitadas: la tesis de Ribeiro (registro del catálogo, no se usaba).

Recodificado con el estatuto:
- revocabilidad 0, baja→alta: art. 230, solo destituye el directorio superior.
- rotación 0→3, baja→alta: arts. 21 y 31, como máximo 2 mandatos de 3 años en el mismo cargo de la Ejecutiva.
- pluralismo 3→4, media: arts. 22 y 233-237. Las tendencias tienen registro, boletines internos y finanzas propias. La ficha decía que no tenían finanzas ni prensa, y eso era la resolución de 1987, no el estatuto de 2001.
- autonomía 1, media→alta: arts. 17, 18 y 229.
- agenda 2, baja→alta: arts. 24, 41 y 62.
- capacidad_ejecutiva 3, baja→media: arts. 67 y 112.
- freq_soberano 24→36, media: el estatuto no fija periodicidad; se toma el ciclo de los mandatos (art. 21).
- freq_intermedio 3→1, media: art. 76, aplicado por remisión.
- Mandato, elección, niveles, regla, estructura y coste, con artículos.

Afirmaciones quitadas o corregidas:
- «Lula como liderazgo externo a los órganos»: sin fuente.
- El congreso de 2007: la fuente solo cita 1991 y 1999.
- El año 2004 del PSOL.
- «El mismo patrón que Podemos, quince años antes»: comparación propia y con la fecha mal.
- «El PED sustituye la deliberación de los encuentros»: incorrecto, porque los encuentros siguen deliberando (art. 19). Se corrige.
- Las bancadas aparecían como «elegidas por el DN»: falso, se quita el enlace.

Sin fuente: profesionalizacion (1, baja). El estatuto no regula si la dirección cobra.

## SYRIZA (`syriza`)

Fuentes añadidas:
- To Vima (dimisión de Koronakis)
- Copia en web.archive.org de la historia oficial de syriza.gr (daba 404)

Comprobado en el estatuto griego:
- Corregido: el art. 14.3 no dice que el presidente lo elija el congreso, sino que el congreso decide qué cuerpo lo elige. La elección directa en 2013 se toma de LINKS y Kouvelakis.
- Se añaden el art. 13.15 (consulta vinculante a las OM sobre asuntos importantes), el art. 29.3 (escala salarial y entrega de retribuciones) y el art. 30.6 (listas proporcionales).
- pluralismo sube de media a alta.

Afirmaciones quitadas o corregidas:
- «Tsipras propuso un referéndum interno»: sin fuente.
- El «congreso extraordinario acordado para septiembre»: la fuente habla de una conferencia extraordinaria acordada por el Comité Central.
- La dimisión de «buena parte de la juventud»: sin fuente.
- «Sobrevivió como partido de gobierno convencional»: sin fuente.
- «Del 4,6 % al 27 %»: solo consta el 27 %.
- «2 millones de votantes»: sin fuente.
- «El grupo parlamentario fue el centro de decisión desde 2012»: se sustituye por la tesis de Kouvelakis, presentada como advertencia y no como hecho.
- El número de firmantes del Comité Central: 108 según IV y 109 según Jacobin; se indican los dos.

Sin fuente: ningún código.

## Fagor Electrodomésticos (`fagor`)

Fuentes añadidas:
- Ley 4/1993 de Cooperativas de Euskadi (BOE). Es la norma vinculante, porque los estatutos de Fagor no son públicos.
- Preprint de Basterretxea et al. 2022 (copia en web.archive.org de Open Research Online). Sustituye a addi.ehu.eus, que daba 404.
- Copia de CLEO en web.archive.org (daba 403).

Fuentes quitadas: HAL halshs-00511301. Está protegido por Anubis y no se pudo leer.

Recodificado:
- agenda 1, media→alta: arts. 33.3-33.4.
- capacidad_ejecutiva 3, media→alta: arts. 40 y 41.6.
- regla_decision: arts. 36 y 46.3.
- revocabilidad 2: arts. 31.3 y 44.2.
- tamaño, media→alta: Valencia Plaza.

Afirmaciones quitadas o corregidas:
- «Ulgor»: sin fuente.
- «Una de las mayores del mundo durante décadas»: se sustituye por «la mayor cooperativa industrial del mundo en 2013», que es lo que dice la fuente.
- «Directivos del ámbito Mondragon»: sin fuente.
- La frecuencia mensual del Consejo Rector: sin fuente.
- «La intercooperación no bastó»: se sustituye por la negativa de fondos de la Corporación.
- El cese de 2006: Campusa lo atribuye a la presión del Consejo Social, y Basterretxea et al. 2022 recoge versiones (la Asamblea, el Consejo Social) y señala que formalmente correspondía al Consejo Rector. Se mantiene con las dos fuentes.

Sin fuente: freq_intermedio_meses (baja).

## Cooperativa Integral Catalana (`cic`)

Fuentes añadidas:
- Documentos de funcionamiento de la CIC «Toma de decisiones» (2014) y «Participación asamblearia» (2013), en copias de web.archive.org. Valen como norma según REGLA_FORMAL.

Recodificado con esos documentos:
- agenda 1→3: cualquier socio puede añadir puntos, y Coordinación prepara el orden del día.
- pluralismo, baja→media.
- regla_decision, niveles y coste, con documento.
- freq_soberano: mensual, o quincenal según la versión de 2014.

Afirmaciones quitadas:
- «Comisiones de 2 a 8 miembros»: sin fuente.
- «Deciden por consenso en su asamblea mensual»: no vale para todas las comisiones.
- «La Asamblea valida la composición de las comisiones»: sin fuente.
- «Cooptación de hecho»: sin fuente.
- «Los disidentes montan su propio proyecto»: sin fuente.
- «Desde 2017» en `estado.desde`: se quita el campo.
- Jornadas «varias veces al año»: se corrige a mensual, según el documento.

Sin fuente: eleccion_direccion (3, baja).

## Occupy Wall Street (`occupy`)

Fuentes añadidas:
- Propuesta de estructura del Consejo de Portavoces aprobada por la NYCGA (nycga.net, web.archive.org). Es el acuerdo de asamblea que sirve como norma.
- Wikipedia, «Occupy Wall Street»
- Copias en web.archive.org de Dissent y Naked Capitalism (daban 403)

Recodificado con la propuesta:
- mandato, revocabilidad, rotación, agenda, pluralismo y autonomía suben a confianza alta.
- capacidad_ejecutiva 0→1: la asamblea delegaba a veces en el comité de acción directa (Wikipedia).
- coste_coordinacion 0→1.
- freq_soberano 0,03→0,06: cuatro noches por semana desde el Consejo.
- freq_intermedio 0,1→0,08.

Afirmaciones quitadas o corregidas:
- Tamaño de «2.000 participantes regulares»: sin fuente. Se cambia por unos 300, la votación de 280 contra 17.
- «Unos cien grupos»: la fuente dice más de 70.
- «Se crearía aprobase o no la asamblea»: sin fuente.
- «Cientos de miles de dólares»: se sustituye por la cita «un millón».
- «A comienzos de 2012 la NYCGA dejó de funcionar»: sin fuente.
- Strike Debt: sin fuente.
- «Asamblea diaria a las 19 h»: se corrige al calendario de la propuesta.

Sin fuente: profesionalizacion (3, baja). estructura_federal queda con una parte sin fuente (media).
