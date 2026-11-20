import type { Handle } from 'remix/component'

import { CB_KEYS, GRUPO_LABEL, REGLA_CIMA, REGLA_FORMAL, SIN_FUENTE, UMBRAL_FUENTES, VARS, type Pesos } from '../lib/codebook.ts'
import { PROB_ERROR, SIMULACIONES } from '../lib/metrics.ts'
import { routes } from '../routes.ts'
import { Document } from './document.tsx'

const FORMULA = `Control de base (CB) =
  media ponderada(mandato, revocabilidad, rotación,
                  no-profesionalización, elección de dirección,
                  agenda desde la base, pluralismo, autonomía,
                  proximidad con mandato)  × 25
  × (1 − 0,5 · brecha/4)

proximidad con mandato = 4 · c^saltos
  c = (mandato + revocabilidad) / 8      saltos ← organigrama

Agilidad = media(vía base, vía dirección)

  vía base = media(frecuencia del órgano intermedio,
                   frecuencia del órgano soberano,
                   niveles a atravesar = 5 − saltos) × 25
    frecuencia: ≤1 semana → 4 · ≤2 meses → 3 · ≤6 → 2 · ≤12 → 1

  vía dirección (centralización ejecutiva) =
             media(regla de decisión, capacidad ejecutiva) × 25

Escalabilidad = media(estructura replicable,
                      bajo coste de coordinación) × 25

Riesgo oligárquico (derivado; supone la ley de Michels) =
  [(4−no-prof.) + (4−rotación) + (4−elección) + brecha] / 16
  × (0,5 + 0,5 · tamaño/4) × 100
  tamaño = log10(N) − 2, entre 0 y 4, solo si N es membresía

Una variable sin dato se descarta de su media.
Sin brecha, CB no se calcula (no se supone 0).`

export function MetodoPage(handle: Handle<{ pesos: Pesos; guardado: string | null }>) {
  return () => {
    let { pesos, guardado } = handle.props
    return (
      <Document seccion="metodo" title="Método y datos">
        <section class="view">
          <div class="grid2">
            <div class="panel prose">
              <h2>Cómo se calcula</h2>
              <p>
                Cada organización se describe con {VARS.length} variables en una escala 0-4:{' '}
                {VARS.filter((v) => !v.calc).length} codificadas a mano y {VARS.filter((v) => v.calc).length}{' '}
                calculadas a partir del organigrama, la frecuencia de reuniones o el tamaño. Cada código lleva una
                justificación y un nivel de confianza (alta: leído en estatutos; media: fuentes secundarias; baja:
                estimación). Cualquiera puede revisarlos en las{' '}
                <a href={routes.revision.href()}>fichas de revisión</a>, imprimibles. Con eso se calculan estos índices
                de 0 a 100:
              </p>
              <div class="formula">{FORMULA}</div>
              <h3>Proximidad con mandato</h3>
              <p>
                Los <b>saltos</b> se cuentan siguiendo las aristas «elige a» del organigrama desde la afiliación
                hasta el órgano marcado como cima. Pero estar a un salto no basta: elegir por voto directo a una
                secretaría general sin mandato ni revocación es un plebiscito, no control. Por eso cada salto
                conserva una fracción <i>c</i> del control, que depende del mandato y de la revocabilidad. Con
                mandato imperativo y revocación inmediata (<i>c</i> = 1), una cadena de cuatro saltos conserva todo
                el control; con <i>c</i> = 0,5, un salto conserva la mitad y cuatro saltos, un dieciseisavo. Supone
                que el mandato es igual en todos los niveles, lo que es una simplificación.
              </p>
              <h3>Qué órgano es la cima</h3>
              <p>
                {REGLA_CIMA} Cada ficha debe marcar exactamente una cima; si hay dos, la ficha no se carga.
              </p>
              <h3>Agilidad y sus dos vías</h3>
              <p>
                La agilidad es la rapidez de la organización para decidir y actuar. Se consigue por dos vías y el
                índice es la media de ambas. La <b>vía base</b>: órganos colectivos que se reúnen a menudo y están a
                pocos saltos de la cima. La <b>vía dirección</b>: una dirección que decide por su cuenta, por mayoría
                simple y con margen amplio, es decir, centralización ejecutiva.
              </p>
              <p>
                Que las organizaciones centralizadas salgan ágiles es correcto, y por eso el índice total tiende a
                bajar cuando sube el control de base: la vía dirección es justo lo contrario del control de base.
                Esa relación viene en parte de la definición, no solo de los datos. Las vías se muestran por separado
                en cada ficha para responder a la pregunta que interesa a una organización de base: <b>¿se puede ser
                ágil sin centralizar?</b> Las que puntúan alto en control de base y en la vía base son la prueba de
                que sí.
              </p>
              <h3>Escalabilidad</h3>
              <p>
                Interesa cuánto puede crecer una organización antes de dejar de funcionar y necesitar una reforma.
                Ese umbral casi nunca se observa, así que el índice mide la <b>estructura</b>: si el crecimiento se
                absorbe creando unidades iguales a las que ya hay y cuánto cuesta coordinarlas. El tamaño alcanzado
                ya no suma: solo demuestra que la estructura aguanta al menos ese tamaño, y además mezcla unidades
                (afiliadas, familias, población gobernada). La medida directa son las crisis de crecimiento (el
                tamaño en que una organización tuvo que reformarse), que las fichas pueden registrar en el campo{' '}
                <code>crisis_crecimiento</code>. Todavía no puntúan porque faltan datos de casi todas.
              </p>
              <h3>Incertidumbre y bandas</h3>
              <p>
                Muchos códigos son estimaciones. Para ver cuánto importa, se repite el cálculo {SIMULACIONES} veces y
                en cada una se desvía cada código un punto arriba o abajo con una probabilidad que depende de su
                confianza: {PROB_ERROR.alta * 100} % si es alta, {PROB_ERROR.media * 100} % si es media y{' '}
                {PROB_ERROR.baja * 100} % si es baja. El <b>intervalo del 90 %</b> que acompaña a cada índice y a cada
                puesto es el rango en que cae el resultado en 9 de cada 10 repeticiones. Las probabilidades son una
                convención, no una medida: sirven para no tomar por diferencias reales lo que es ruido de
                codificación. En la portada y en las tarjetas los índices se agrupan en <b>bandas</b>: bajo (0-33),
                medio (33-67) y alto (67-100). Si el intervalo cruza un corte, la banda se escribe doble
                («medio–alto»).
              </p>
              <h3>Marco normativo</h3>
              <p>
                El libro de códigos no es neutral. Puntúa como más control de base el mandato imperativo, la
                revocación inmediata, la rotación, los cargos no remunerados y la autonomía federal, que son los
                rasgos del modelo asambleario y anarcosindicalista. Eso es una decisión deliberada sobre qué se
                quiere medir («cuánto decide la base»), no un resultado. Una organización puede puntuar bajo aquí y
                funcionar bien con otros criterios (eficacia, estabilidad, capacidad de negociación).
              </p>
              <h3>Estatutos frente a práctica</h3>
              <p>
                {REGLA_FORMAL} La brecha no sale de datos internos de cada organización, que casi nunca son públicos:
                es una estimación a partir de fuentes públicas (prensa, escisiones y expulsiones, resultados de
                congresos, candidaturas únicas, permanencia real en los cargos). Por eso casi siempre tiene confianza
                media o baja, y la simulación de incertidumbre la trata en consecuencia. Quien conozca una organización
                por dentro puede corregirla en su ficha de revisión.
              </p>
              <h3>Cobertura de fuentes</h3>
              <p>
                Cada código debe apoyarse en una fuente con URL: estatutos o normas, estudios o, como mínimo, prensa.
                Los que no la tienen llevan confianza baja y empiezan por «{SIN_FUENTE}». La columna «Con fuente» del
                panorama cuenta cuántos de los códigos codificados a mano la tienen. Las fichas por debajo del{' '}
                {UMBRAL_FUENTES * 100} % se pueden ocultar con un filtro: sus índices son sobre todo estimación.
              </p>
              <h3>Riesgo oligárquico: un índice derivado</h3>
              <p>
                Este índice <b>da por cierta la ley de hierro de la oligarquía</b> de Robert Michels (1911): toda
                organización grande tiende a que una minoría profesional se haga con el poder. No es una medida
                independiente, sino una lectura de otras variables con esa hipótesis como premisa:
              </p>
              <ul>
                <li>
                  Reutiliza cuatro variables que ya cuentan en el control de base: profesionalización, rotación,
                  elección de la dirección y brecha formal-real.
                </li>
                <li>Las multiplica por el tamaño: con la misma estructura, una organización diez veces mayor sale con más riesgo.</li>
              </ul>
              <p>
                Por eso va casi en espejo del control de base y <b>no aporta evidencia nueva</b>. Lo que añade es la
                advertencia: una organización de base que crece y mantiene liberados sin rotación es la que, según
                Michels, más cuidado debe tener. Si no aceptas la premisa, ignora este índice. Para que fuera una
                medida propia harían falta datos independientes: años medios en el cargo, proporción de candidaturas
                únicas o número de liberados por cada mil personas afiliadas.
              </p>
              <h3 id="pesos">Pesos del control de base</h3>
              {guardado ? (
                <p class="flash" role="status">
                  {guardado === 'reset' ? 'Pesos restablecidos.' : 'Pesos guardados. Los índices ya usan los nuevos valores.'}
                </p>
              ) : null}
              <form method="post" action={routes.pesos.action.href()}>
                <div class="weights">
                  {CB_KEYS.map((k) => (
                    <label for={`w-${k}`}>
                      <span>{VARS.find((v) => v.k === k)?.l}</span>
                      <input type="number" id={`w-${k}`} name={k} min="0" max="3" step="0.5" value={String(pesos[k])} />
                    </label>
                  ))}
                </div>
                <p class="row" style={{ gap: '8px', marginTop: '12px' }}>
                  <button class="btn" type="submit">
                    Guardar pesos
                  </button>
                  <button class="btn ghost" type="submit" name="reset" value="1">
                    Restablecer
                  </button>
                </p>
              </form>
            </div>
            <div class="panel prose">
              <h2>Métodos cuantitativos que puedes aplicar</h2>
              <ol>
                <li><b>Índices de poder de voto (Banzhaf; también Shapley-Shubik).</b> Para plenos con voto ponderado. Miden el poder real de cada delegación frente a su peso nominal. Banzhaf está en la <a href={routes.calculadora.href()}>calculadora</a>; Shapley-Shubik, todavía no.</li>
                <li><b>Minoría mínima ganadora.</b> El porcentaje más pequeño de la afiliación total que puede imponer un acuerdo.</li>
                <li><b>Desproporcionalidad (Loosemore-Hanby; también Gallagher).</b> Distancia entre el porcentaje de afiliación y el porcentaje de poder. La calculadora usa Loosemore-Hanby.</li>
                <li><b>Distancia de delegación.</b> Saltos entre la base y el órgano que decide; con mandato libre, cada salto diluye el control.</li>
                <li><b>Gráfico de control de Tannenbaum.</b> Encuesta a la afiliación sobre cuánta influencia tiene cada nivel. La pendiente mide la concentración y el área total, el control.</li>
                <li><b>Análisis de redes (centralidad de Freeman).</b> Sobre quién comunica con quién. Detecta intermediarios que concentran información sin tener cargo.</li>
                <li><b>Rotación efectiva.</b> Índice Herfindahl de las personas que ocupan cargos a lo largo de 10 años.</li>
                <li><b>Participación.</b> Asistencia a asambleas dividida por la afiliación.</li>
                <li><b>Latencia de decisión.</b> Días desde que se presenta una propuesta hasta que se aprueba, medidos en las actas.</li>
                <li><b>Coste de decisión de Buchanan-Tullock.</b> Con consenso, el coste de decidir crece de forma combinatoria con N; con mayoría, casi lineal, pero aumenta el coste para la minoría.</li>
              </ol>
            </div>
          </div>
          <div class="panel">
            <h2>Libro de códigos</h2>
            <dl class="codebook">
              {VARS.map((v) => (
                <>
                  <dt>
                    {v.l}{' '}
                    <span class="sub mono">
                      {GRUPO_LABEL[v.g]}
                      {v.calc ? ' · calculada' : ''}
                    </span>
                  </dt>
                  <dd>
                    {v.a
                      .map((a, i) => (a ? `${i} ${a}` : ''))
                      .filter(Boolean)
                      .join(' · ')}
                    {v.nota ? <div class="sub">{v.nota}</div> : null}
                  </dd>
                </>
              ))}
            </dl>
          </div>
          <div class="grid2">
            <div class="panel prose">
              <h2>Añadir o corregir una organización</h2>
              <p>
                Cada organización es un archivo en <code>data/orgs/&lt;id&gt;.json</code>. Para añadir una, copia
                cualquiera de ellos, cambia el <code>id</code> y rellena los campos. El servidor lee los archivos
                en cada petición, así que basta con recargar la página. El esquema está en el <code>README.md</code>.
              </p>
              <p>
                Los datos completos, con los índices calculados con tus pesos, están en{' '}
                <a href={routes.apiOrgs.href()}>/api/orgs.json</a>.
              </p>
            </div>
            <div class="panel prose">
              <h2>Límites de este análisis</h2>
              <ul>
                <li>La CNT y la CGT están codificadas a partir de sus estatutos vigentes (2022), y el Sindicato de Inquilinas de Madrid a partir de su organigrama oficial (2025). El resto, a partir de fuentes secundarias. Revisa las marcas de confianza: casi un cuarto de los códigos son de confianza baja.</li>
                <li>
                  Una sola persona ha codificado todas las fichas. Como control provisional, se han recodificado a ciegas
                  con un agente de IA que solo recibió el libro de códigos vigente, el nombre y las fuentes, y que tuvo
                  que citar para cada código una fuente que hubiera abierto. Tras reescribir los anclajes de
                  revocabilidad, pluralismo, estructura replicable y capacidad ejecutiva, la comprobación se repitió con
                  seis organizaciones distintas de las usadas para ajustarlos (CGT, PSOE, PAH, Fagor, SYRIZA y MST).
                  Coincidieron exactamente en el 57 % de los códigos y a ±1 punto en el 96 %. El alfa de Krippendorff
                  ordinal fue 0,77 en las 13 variables manuales y 0,79 en las de control de base, por debajo de lo
                  obtenido con las seis primeras (0,89): aquel resultado estaba inflado por haber ajustado los anclajes
                  sobre esos mismos casos. El índice de control de base cambió de media 6 puntos, y 12 o 13 en la CGT y
                  Fagor. Pluralismo y estructura replicable superan ya el umbral de 0,667; revocabilidad, capacidad
                  ejecutiva, agenda desde la base y brecha formal-real no. La mayor fuente de desacuerdo era qué órgano
                  cuenta como cima en cooperativas y movimientos sin ejecutivo; en las cooperativas se ha fijado después
                  el Consejo Rector. Con seis casos estos valores son muy inciertos y solo sirven para señalar anclajes
                  ambiguos. Un agente de IA es un control más débil que una segunda persona: usa las mismas fuentes y
                  puede compartir sesgos de lectura. Hace falta una segunda codificación humana; cualquiera puede
                  hacerla siguiendo <code>data/codificaciones/README.md</code>.
                </li>
                <li>La muestra no es representativa: la mayoría de las organizaciones son del Estado español y de izquierda, hay solo dos cooperativas y solo organizaciones que siguen existiendo. No sirve para sacar medias por familia.</li>
                <li>Se comparan con la misma escala sindicatos, partidos, una fábrica recuperada y administraciones territoriales con estructura militar (EZLN, DAANES). Compara dentro de cada familia antes de comparar entre familias.</li>
                <li>
                  Los estatutos describen el poder formal. La «brecha formal-real» es un juicio cualitativo y el código
                  que más mueve el ranking. En 11 organizaciones (Anticapitalistas, CGT, CNT, co.bas, IWW, MONDRAGON,
                  MST, PAH, PCTE, PSOE y Zanón) no tiene fuente verificable: se marca así, con confianza baja, y su
                  valor se ha rebajado un punto para no penalizar sin pruebas. Eso sube su control de base; en la CNT,
                  la brecha queda en 0. Conviene contrastarla con datos de rotación, participación y redes.
                </li>
                <li>Varias organizaciones no publican su afiliación (PCTE, Anticapitalistas, CNT, co.bas, Podemos, PSOE): su tamaño es una estimación. El de EZLN y DAANES es población y el del MST, familias; ninguno se puntúa.</li>
                <li>El tramo de más de 300 afiliaciones del Congreso de la CGT («1 voto por cada 100 o fracción») se ha leído como 7 votos más 1 por cada 100 adicionales, para que la tabla no decrezca.</li>
              </ul>
            </div>
          </div>
        </section>
      </Document>
    )
  }
}
