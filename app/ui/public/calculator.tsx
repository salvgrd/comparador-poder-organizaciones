import { clientEntry, on, type Handle } from 'remix/component'

import { analizar, ESQUEMAS, parseUnidades, pct } from '../../lib/voting.ts'

interface CalculatorProps {
  unidades: string
  esquema: string
  umbral: number
}

const UMBRALES: [number, string][] = [
  [0.5, 'Mayoría simple (>50%)'],
  [0.6667, 'Dos tercios'],
  [0.75, '75%'],
]

const ratio = (x: number) => '×' + x.toLocaleString('es-ES', { maximumFractionDigits: 1 })

// Se renderiza en el servidor con el ejemplo y se hidrata para recalcular al escribir.
export const Calculator = clientEntry(
  import.meta.url,
  function Calculator(handle: Handle<CalculatorProps>) {
    let texto = handle.props.unidades
    let esquema = handle.props.esquema
    let umbral = handle.props.umbral
    let compararTodos = false

    return () => {
      let units = parseUnidades(texto)
      let valido = units.length >= 2 && units.length <= 60
      let r = valido ? analizar(units, esquema, umbral) : null

      return (
        <div class="grid2">
          <div class="panel form">
            <div>
              <label for="calc-units">Unidades (nombre:afiliadas, una por línea)</label>
              <textarea
                id="calc-units"
                spellcheck={false}
                defaultValue={handle.props.unidades}
                mix={on('input', (event) => {
                  texto = event.currentTarget.value
                  handle.update()
                })}
              />
              <p class="notice" style={{ margin: '4px 0 0' }}>
                El ejemplo usa tamaños inventados. Sustitúyelo por los datos reales de cotización.
              </p>
            </div>
            <div class="row">
              <div>
                <label for="calc-scheme">Sistema de ponderación</label>
                <select
                  id="calc-scheme"
                  mix={on('change', (event) => {
                    esquema = event.currentTarget.value
                    handle.update()
                  })}
                >
                  {Object.entries(ESQUEMAS).map(([k, s]) => (
                    <option value={k} selected={k === esquema}>
                      {s.l}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label for="calc-quota">Umbral</label>
                <select
                  id="calc-quota"
                  mix={on('change', (event) => {
                    umbral = Number(event.currentTarget.value)
                    handle.update()
                  })}
                >
                  {UMBRALES.map(([v, l]) => (
                    <option value={String(v)} selected={v === umbral}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div class="row" style={{ alignItems: 'center' }}>
              <button
                class="btn ghost"
                type="button"
                aria-pressed={compararTodos}
                mix={on('click', () => {
                  compararTodos = !compararTodos
                  handle.update()
                })}
              >
                {compararTodos ? 'Ocultar comparación' : 'Comparar todos los sistemas'}
              </button>
            </div>
            {compararTodos && valido ? (
              <div class="scroll-x">
                <table>
                  <thead>
                    <tr>
                      <th>Sistema</th>
                      <th>Minoría mín. ganadora</th>
                      <th>Desproporción</th>
                      <th>Peso máx./mín.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(ESQUEMAS).map(([k, s]) => {
                      let a = analizar(units, k, umbral)
                      return (
                        <tr>
                          <td>{s.l}</td>
                          <td class="num">{pct(a.mwc)}</td>
                          <td class="num">{pct(a.lh)}</td>
                          <td class="num">{ratio(a.ratio)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                <p class="notice">
                  Un sistema justo en términos de afiliación tiende a una minoría ganadora cercana al 50% y una
                  desproporción cercana a 0. Las tablas degresivas protegen a las unidades pequeñas a costa de la
                  afiliación de las grandes.
                </p>
              </div>
            ) : null}
          </div>
          <div class="panel">
            {r ? (
              <>
                <div class="stats">
                  <div class="stat">
                    <b>{pct(r.mwc)}</b>
                    <span>de la afiliación basta para ganar una votación (minoría mínima ganadora)</span>
                  </div>
                  <div class="stat">
                    <b>{pct(r.lh)}</b>
                    <span>de desproporcionalidad entre afiliación y poder (Loosemore-Hanby)</span>
                  </div>
                  <div class="stat">
                    <b>{ratio(r.ratio)}</b>
                    <span>es lo que pesa una afiliada del grupo más favorecido frente al menos favorecido</span>
                  </div>
                  <div class="stat">
                    <b>
                      {r.q}/{r.total}
                    </b>
                    <span>votos necesarios para ganar sobre el total</span>
                  </div>
                </div>
                <div class="scroll-x" style={{ marginTop: '14px' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Unidad</th>
                        <th>Afiliadas</th>
                        <th>% afiliación</th>
                        <th>Votos</th>
                        <th>% votos</th>
                        <th>Banzhaf</th>
                        <th>Poder / afiliación</th>
                      </tr>
                    </thead>
                    <tbody>
                      {units.map((u, i) => {
                        let pr = r.bz[i] / r.share[i]
                        return (
                          <tr>
                            <td>{u.n}</td>
                            <td class="num">{u.a.toLocaleString('es-ES')}</td>
                            <td class="num">{pct(r.share[i])}</td>
                            <td class="num">{r.w[i]}</td>
                            <td class="num">{pct(r.w[i] / r.total)}</td>
                            <td class="num">
                              <div class="bar" style={{ justifyContent: 'flex-end' }}>
                                <b>{pct(r.bz[i])}</b>
                                <i style={{ width: `${Math.max(2, r.bz[i] * 160)}px` }}></i>
                              </div>
                            </td>
                            <td class="num" style={{ color: pr > 1.25 ? 'var(--good)' : pr < 0.8 ? 'var(--bad)' : 'inherit' }}>
                              ×{pr.toFixed(2)}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                <p class="notice">
                  Banzhaf normalizado: porcentaje de las veces que cada unidad es decisiva sobre el total de
                  situaciones decisivas. Supone voto en bloque y que todas las unidades votan.
                  {r.escalado ? ' Los pesos se han escalado para el cálculo.' : ''}
                </p>
              </>
            ) : (
              <p class="msg err" role="status">
                Introduce entre 2 y 60 unidades con su número de afiliadas, por ejemplo «Sindicato A:120».
              </p>
            )}
          </div>
        </div>
      )
    }
  },
)
