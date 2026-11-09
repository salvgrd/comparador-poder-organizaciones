import type { Handle, RemixNode } from 'remix/component'
import { ImportMap } from 'remix/component/server'

import { scriptEntry } from '../assets.ts'
import { routes } from '../routes.ts'

export type Seccion = 'panorama' | 'comparar' | 'calculadora' | 'metodo'

export interface DocumentProps {
  children?: RemixNode
  title?: string
  seccion?: Seccion
}

const APP = 'Cartografía del poder obrero'

const NAV: { s: Seccion; label: string; href: string }[] = [
  { s: 'panorama', label: 'Panorama', href: routes.home.href() },
  { s: 'comparar', label: 'Comparar', href: routes.comparar.href() },
  { s: 'calculadora', label: 'Calculadora de voto', href: routes.calculadora.href() },
  { s: 'metodo', label: 'Método y datos', href: routes.metodo.href() },
]

export function Document(handle: Handle<DocumentProps>) {
  return () => {
    let { children, title, seccion } = handle.props
    let { href, importMap, preloads } = scriptEntry

    return (
      <html lang="es">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
          <meta name="color-scheme" content="light dark" />
          <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
          <title>{title ? `${title} · ${APP}` : APP}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@75..100,500..800&family=Public+Sans:ital,wght@0,400;0,600;1,400&family=IBM+Plex+Mono:wght@400;500&display=swap"
          />
          <link rel="stylesheet" href="/styles.css" />
          <ImportMap value={importMap} />
          {preloads.map((preloadHref) => (
            <link key={preloadHref} rel="modulepreload" href={preloadHref} />
          ))}
          <script type="module" src={href}></script>
        </head>
        <body>
          <header class="top">
            <div class="wrap">
              <div class="brand">
                <h1>
                  Cartografía del <span>poder</span> obrero
                </h1>
                <p>
                  Dónde reside el poder en sindicatos, partidos y movimientos autogestionados.
                  Comparación estructural y cuantitativa.
                </p>
              </div>
              <nav class="tabs" aria-label="Secciones">
                {NAV.map((n) => (
                  <a href={n.href} aria-current={n.s === seccion ? 'page' : undefined}>
                    {n.label}
                  </a>
                ))}
              </nav>
            </div>
          </header>
          <main class="wrap">{children}</main>
          <footer class="wrap foot">
            Datos en <code>data/orgs/</code> · también disponibles como{' '}
            <a href={routes.apiOrgs.href()}>JSON</a> para el análisis.
          </footer>
        </body>
      </html>
    )
  }
}
