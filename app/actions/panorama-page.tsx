import type { Handle } from 'remix/component'

import { UMBRAL_FUENTES, VARS } from '../lib/codebook.ts'
import type { OrgConIndices } from '../lib/metrics.ts'
import { routes } from '../routes.ts'
import { FamLegend, Scatter } from '../ui/charts.tsx'
import { Heatmap, IndexTable, Insights, type ClaveOrden } from '../ui/tables.tsx'
import { Document } from './document.tsx'

export interface Filtro {
  activas: boolean
  fuentes: boolean
}

function hrefFiltro(f: Filtro) {
  let q = [f.activas ? 'activas=1' : '', f.fuentes ? 'fuentes=1' : ''].filter(Boolean).join('&')
  return q ? `${routes.home.href()}?${q}` : routes.home.href()
}

function Filtros(handle: Handle<{ filtro: Filtro; nFracasos: number; nSinFuentes: number }>) {
  return () => {
    let { filtro, nFracasos, nSinFuentes } = handle.props
    return (
      <div class="notice">
        {nFracasos ? (
          <p style={{ margin: '0 0 4px' }}>
            {filtro.activas
              ? `Se ocultan ${nFracasos} casos disueltos, escindidos o burocratizados. `
              : `La muestra incluye ${nFracasos} casos disueltos, escindidos o burocratizados, marcados en la tabla, para no ver solo a las organizaciones que sobrevivieron. `}
            <a href={hrefFiltro({ ...filtro, activas: !filtro.activas })}>
              {filtro.activas ? 'Incluirlos' : 'Ver solo las activas'}
            </a>
            .
          </p>
        ) : null}
        {nSinFuentes ? (
          <p style={{ margin: 0 }}>
            {filtro.fuentes
              ? `Se ocultan ${nSinFuentes} organizaciones con menos del ${UMBRAL_FUENTES * 100} % de sus códigos con fuente verificable. `
              : `${nSinFuentes} organizaciones tienen menos del ${UMBRAL_FUENTES * 100} % de sus códigos con fuente verificable: sus índices son sobre todo estimación (columna «Con fuente»). `}
            <a href={hrefFiltro({ ...filtro, fuentes: !filtro.fuentes })}>
              {filtro.fuentes ? 'Incluirlas' : 'Ver solo las fichas con fuentes'}
            </a>
            .
          </p>
        ) : null}
      </div>
    )
  }
}

export function PanoramaPage(
  handle: Handle<{
    orgs: OrgConIndices[]
    orden: ClaveOrden
    dir: 1 | -1
    filtro: Filtro
    nFracasos: number
    nSinFuentes: number
  }>,
) {
  return () => {
    let { orgs, orden, dir, filtro, nFracasos, nSinFuentes } = handle.props
    return (
      <Document seccion="panorama">
        <section class="view">
          <div>
            <h2>Control de base frente a agilidad</h2>
            <p class="lede">
              Cada organización se sitúa según cuánto control conserva la base sobre las decisiones (eje
              horizontal) y con qué rapidez puede decidir y actuar (eje vertical). El tamaño del punto indica la membresía.
              Los índices se calculan a partir de una codificación 0-4 de {VARS.length} variables y del organigrama.
              Como parte de los datos son estimaciones, se leen por bandas (bajo, medio, alto) y no por puntos. Los
              pesos se ajustan en <a href={routes.metodo.href()}>Método y datos</a>.
            </p>
            <Filtros filtro={filtro} nFracasos={nFracasos} nSinFuentes={nSinFuentes} />
          </div>
          <div class="panel">
            <FamLegend />
            <div class="scroll-x" style={{ marginTop: '8px' }}>
              <Scatter orgs={orgs} />
            </div>
          </div>
          <div class="grid2">
            <div class="panel prose">
              <h3>Cómo leer el gráfico</h3>
              <p>
                Los ejes están divididos en tres bandas: bajo, medio y alto. Una organización cerca de un corte puede
                estar en realidad en la banda de al lado, porque muchos códigos son estimaciones. El margen de cada
                una está en la tabla de abajo y, en detalle, en su ficha.
              </p>
              <p>
                La <b>agilidad</b> tiene dos vías y el índice es la media de ambas. La <b>vía base</b>: órganos
                colectivos que se reúnen a menudo y están a pocos saltos de la cima. La <b>vía dirección</b>: una
                dirección que decide por su cuenta. Una organización centralizada sale ágil por la segunda aunque tenga
                poco control de base; eso es esperable. Lo que interesa buscar son las que salen ágiles por la primera.
                El desglose está en la ficha de cada una.
              </p>
              <p>
                El tamaño del punto es la membresía, en escala logarítmica. Los puntos huecos son organizaciones
                cuyo tamaño es población o familias y no se puede comparar.
              </p>
            </div>
            <div class="panel">
              <h3>Lectura rápida</h3>
              <Insights orgs={orgs} />
            </div>
          </div>
          <div class="panel">
            <h3>Índices por organización</h3>
            <p class="notice" style={{ margin: '0 0 8px' }}>
              Pulsa una cabecera para ordenar y un nombre para abrir su ficha. Cada índice (0-100) muestra su tramo:
              el intervalo en que cae en 9 de cada 10 simulaciones, desviando los códigos según su confianza.
              Pasa el cursor para ver el valor central. <b>Puesto</b> es el tramo de puestos en control de base.{' '}
              <b>Saltos</b> = número de elecciones encadenadas entre la afiliación y la cima, calculado sobre el
              organigrama.
            </p>
            <div class="scroll-x">
              <IndexTable orgs={orgs} orden={orden} dir={dir} extra={hrefFiltro(filtro).split('?')[1]} />
            </div>
          </div>
          <div class="panel">
            <h3>Huella de variables (0-4)</h3>
            <p class="notice" style={{ margin: '0 0 8px' }}>
              Las celdas más oscuras indican más control de base, agilidad o escalabilidad. En la columna marcada
              con ⇅ (brecha formal-real) el color está invertido: más oscuro es un valor más bajo. Las celdas con borde punteado son de confianza baja. Pasa el cursor por una celda
              para ver la justificación.
            </p>
            <div class="scroll-x">
              <Heatmap orgs={orgs} />
            </div>
          </div>
        </section>
      </Document>
    )
  }
}
