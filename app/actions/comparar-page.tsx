import type { Handle } from 'remix/component'

import type { OrgConIndices } from '../lib/metrics.ts'
import { routes } from '../routes.ts'
import { DotPlot } from '../ui/charts.tsx'
import { OrgCard } from '../ui/org-card.tsx'
import { Document } from './document.tsx'

/** Enlace que añade o quita una organización de la selección (sin JavaScript). */
function alternar(ids: string[], id: string, max: number): string {
  let next = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id].slice(-max)
  return `${routes.comparar.href()}?ids=${next.join(',')}`
}

export function CompararPage(handle: Handle<{ orgs: OrgConIndices[]; ids: string[]; max: number }>) {
  return () => {
    let { orgs, ids, max } = handle.props
    let sel = ids.map((id) => orgs.find((o) => o.id === id)!).filter(Boolean)
    return (
      <Document seccion="comparar" title="Comparar">
        <section class="view">
          <div>
            <h2>Comparar organizaciones</h2>
            <p class="lede">
              Elige hasta tres. Los organigramas se leen de abajo (afiliación) hacia arriba (cima ejecutiva);
              cada flecha significa «elige a». El órgano marcado en color es la cima ejecutiva.
            </p>
          </div>
          <div class="picker">
            {orgs.map((o) => (
              <a class="chip" href={alternar(ids, o.id, max)} aria-pressed={ids.includes(o.id) ? 'true' : 'false'}>
                {o.siglas}
              </a>
            ))}
          </div>
          {sel.length ? (
            <>
              <div class="panel">
                <h3>Variable a variable</h3>
                <DotPlot orgs={sel} />
              </div>
              <div class="cols">
                {sel.map((o) => (
                  <OrgCard o={o} />
                ))}
              </div>
            </>
          ) : (
            <p class="notice">Elige al menos una organización.</p>
          )}
        </section>
      </Document>
    )
  }
}
