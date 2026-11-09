import type { Handle } from 'remix/component'

import { CB_KEYS, GRUPO_LABEL, VARS, type Pesos } from '../lib/codebook.ts'
import { routes } from '../routes.ts'
import { Document } from './document.tsx'

const FORMULA = `Control de base (CB) =
  media ponderada(mandato, revocabilidad, rotación,
                  no-profesionalización, elección de dirección,
                  agenda desde la base, pluralismo, autonomía,
                  proximidad)  × 25
  × (1 − 0,5 · brecha/4)

proximidad = max(0, 5 − saltos)   ← del organigrama

Agilidad = media(regla de decisión, capacidad ejecutiva,
                 frecuencia del órgano intermedio,
                 niveles a atravesar) × 25

Escalabilidad = media(estructura federal,
                      bajo coste de coordinación,
                      tamaño demostrado = log10(N) − 2) × 25

Riesgo oligárquico (Michels) =
  [(4−no-prof.) + (4−rotación) + (4−elección) + brecha] / 16
  × (0,5 + 0,5 · tamaño/4) × 100`

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
                Cada organización se codifica con 16 variables en una escala 0-4. Cada código lleva una
                justificación y un nivel de confianza (alta: leído en estatutos; media: fuentes secundarias; baja:
                estimación). Con eso se calculan cuatro índices de 0 a 100:
              </p>
              <div class="formula">{FORMULA}</div>
              <p>
                La <b>proximidad</b> no se codifica a mano: se calcula siguiendo las aristas «elige a» del
                organigrama desde la afiliación hasta el órgano marcado como cima. Si añades órganos, el índice
                cambia.
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
                <li><b>Índices de poder de voto (Banzhaf, Shapley-Shubik).</b> Para plenos con voto ponderado. Miden el poder real de cada delegación frente a su peso nominal. Están en la <a href={routes.calculadora.href()}>calculadora</a>.</li>
                <li><b>Minoría mínima ganadora.</b> El porcentaje más pequeño de la afiliación total que puede imponer un acuerdo.</li>
                <li><b>Desproporcionalidad (Loosemore-Hanby, Gallagher).</b> Distancia entre el porcentaje de afiliación y el porcentaje de poder.</li>
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
                <li>La CNT y la CGT están codificadas a partir de sus estatutos vigentes (2022), y el Sindicato de Inquilinas de Madrid a partir de su organigrama oficial (2025). El resto, a partir de fuentes secundarias. Revisa las marcas de confianza.</li>
                <li>Los estatutos describen el poder formal. La variable «brecha formal-real» es un juicio cualitativo que conviene contrastar con datos de rotación, participación y redes.</li>
                <li>El PCTE y Anticapitalistas no publican su militancia y los nombres de algunos órganos están sin verificar.</li>
                <li>El tramo de más de 300 afiliaciones del Congreso de la CGT («1 voto por cada 100 o fracción») se ha leído como 7 votos más 1 por cada 100 adicionales, para que la tabla no decrezca.</li>
              </ul>
            </div>
          </div>
        </section>
      </Document>
    )
  }
}
