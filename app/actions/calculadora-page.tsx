import type { Handle } from 'remix/component'

import { Calculator } from '../ui/public/calculator.tsx'
import { Document } from './document.tsx'

export function CalculadoraPage(handle: Handle<{ unidades: string }>) {
  return () => (
    <Document seccion="calculadora" title="Calculadora de voto">
      <section class="view">
        <div>
          <h2>Calculadora de poder de voto</h2>
          <p class="lede">
            En un pleno con voto ponderado, el porcentaje de votos no equivale al poder real. El{' '}
            <b>índice de Banzhaf</b> mide con qué frecuencia una delegación es decisiva, es decir, cuando su cambio
            de voto altera el resultado. Introduce el tamaño de cada sindicato o federación y compara las tablas de
            ponderación de la CNT y la CGT con otros sistemas.
          </p>
        </div>
        <Calculator unidades={handle.props.unidades} esquema="cnt_sind" umbral={0.5} />
      </section>
    </Document>
  )
}
