import type { Handle } from 'remix/component'

import type { OrgConIndices } from '../lib/metrics.ts'
import { routes } from '../routes.ts'
import { FamLegend, Scatter } from '../ui/charts.tsx'
import { Heatmap, IndexTable, Insights, type ClaveOrden } from '../ui/tables.tsx'
import { Document } from './document.tsx'

export function PanoramaPage(handle: Handle<{ orgs: OrgConIndices[]; orden: ClaveOrden; dir: 1 | -1 }>) {
  return () => {
    let { orgs, orden, dir } = handle.props
    return (
      <Document seccion="panorama">
        <section class="view">
          <div>
            <h2>Control de base frente a agilidad</h2>
            <p class="lede">
              Cada organización se sitúa según cuánto control conserva la base sobre las decisiones (eje
              horizontal) y con qué rapidez puede decidir (eje vertical). El tamaño del punto indica la escala.
              Los índices se calculan a partir de una codificación 0-4 de 16 variables y del organigrama. Los
              pesos se ajustan en <a href={routes.metodo.href()}>Método y datos</a>.
            </p>
          </div>
          <div class="grid2">
            <div class="panel">
              <FamLegend />
              <div class="scroll-x" style={{ marginTop: '8px' }}>
                <Scatter orgs={orgs} />
              </div>
              <p class="notice">
                El dilema clásico: arriba a la izquierda, dirección ágil y poco control desde abajo; abajo a la
                derecha, mucho control y decisiones lentas. Arriba a la derecha está lo difícil.
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
              Pulsa una cabecera para ordenar y un nombre para abrir su ficha. <b>Saltos</b> = número de
              elecciones encadenadas entre la afiliación y el órgano ejecutivo superior, calculado sobre el
              organigrama.
            </p>
            <div class="scroll-x">
              <IndexTable orgs={orgs} orden={orden} dir={dir} />
            </div>
          </div>
          <div class="panel">
            <h3>Huella de variables (0-4)</h3>
            <p class="notice" style={{ margin: '0 0 8px' }}>
              Las celdas más oscuras indican más control de base, agilidad o escalabilidad. En «brecha
              formal-real», un valor alto es negativo. Las celdas con borde punteado son de confianza baja. Pasa
              el cursor por una celda para ver la justificación.
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
