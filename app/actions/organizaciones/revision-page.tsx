import type { Handle } from 'remix/component'

import { FAMILIAS, GRUPO_LABEL, REGLA_CIMA, UNIDADES_TAMANO, VARS, type Grupo } from '../../lib/codebook.ts'
import { fmtN, type OrgConIndices } from '../../lib/metrics.ts'
import type { Codigo, Confianza, Org } from '../../lib/types.ts'
import { routes } from '../../routes.ts'
import { Document } from '../document.tsx'

/** Grupos de la sección 4, en orden; las variables calculadas se revisan en las secciones 2 y 3. */
const GRUPOS_REVISION: Grupo[] = ['CB', 'CE', 'ES', 'ajuste']

const LABEL_REVISION: Partial<Record<Grupo, string>> = { CE: 'agilidad vía dirección' }

function meses(m: number): string {
  if (m >= 12 && m % 12 === 0) return m === 12 ? 'cada año' : `cada ${m / 12} años`
  if (m < 1) return m <= 0.25 ? 'cada semana o más' : `cada ${Math.round(m * 4)} semanas`
  return m === 1 ? 'cada mes' : `cada ${fmtNum(m)} meses`
}

const fmtNum = (x: number) => x.toLocaleString('es-ES', { maximumFractionDigits: 1 })

function codigo(o: Org, k: string): Codigo | null {
  let c = o.codigos[k]
  return Array.isArray(c) && typeof c[0] === 'number' ? c : null
}

function Conf(handle: Handle<{ c: Confianza | null | undefined }>) {
  return () => {
    let c = handle.props.c
    return c ? <span class="tag">confianza {c}</span> : null
  }
}

function Check() {
  return () => (
    <div class="rv-check">
      <span class="rv-box">☐ Correcto</span>
      <span class="rv-box">☐ Incorrecto → lo correcto es: ____________________</span>
      <span class="rv-lines">Fuente o comentario:</span>
    </div>
  )
}

function Dato(handle: Handle<{ t: string; v: string; c?: Confianza | null }>) {
  return () => {
    let { t, v, c } = handle.props
    return (
      <div class="rv-item">
        <div class="rv-head">
          <b>{t}</b>
          <Conf c={c} />
        </div>
        <p>{v}</p>
        <Check />
      </div>
    )
  }
}

function Frecuencia(handle: Handle<{ o: Org; k: string; n: string; t: string; q: string }>) {
  return () => {
    let { o, k, n, t, q } = handle.props
    let c = codigo(o, k)
    return (
      <div class="rv-item">
        <div class="rv-head">
          <b>
            {n}. {t}
          </b>
          <Conf c={c?.[2]} />
        </div>
        <p>{q}</p>
        <p>{c ? `Hemos puesto: ${meses(c[0])}. ${c[1]}` : 'No lo hemos podido determinar.'}</p>
        <Check />
      </div>
    )
  }
}

export function RevisionPage(handle: Handle<{ o: OrgConIndices }>) {
  return () => {
    let { o } = handle.props
    let nombre = (id: string) => o.organos.find((n) => n.id === id)?.n ?? id
    let grupos = GRUPOS_REVISION.map((g) => ({ g, vars: VARS.filter((v) => v.g === g && !v.calc) })).filter(
      (x) => x.vars.length,
    )
    return (
      <Document title={`Ficha de revisión · ${o.siglas}`}>
        <section class="view revision">
          <p class="no-print">
            <a href={routes.organizaciones.show.href({ id: o.id })}>← Volver a la ficha de {o.siglas}</a> · Imprime
            esta página o guárdala como PDF desde el navegador.
          </p>
          <div class="panel prose">
            <p class="eyebrow">Ficha de revisión · {FAMILIAS[o.familia].label}</p>
            <h2>
              {o.siglas} <span class="muted">{o.nombre}</span>
            </h2>
            <p>
              <b>Qué te pedimos.</b> Esta ficha recoge cómo hemos descrito la estructura de {o.siglas} a partir de sus
              estatutos y de otras fuentes. Revisa cada dato y marca si es correcto. Si no lo es, escribe lo que
              corresponde y, si puedes, de dónde sale (artículo de los estatutos, acta, experiencia directa). Cada
              característica se puntúa de 0 a 4; abajo están las cinco opciones y la marcada (●) es la que hemos
              elegido. La confianza dice de dónde sale: alta, leído en estatutos; media, fuentes secundarias; baja,
              estimación nuestra. Las de confianza baja son las que más necesitan tu revisión.
            </p>
            <p>
              Revisado por: ______________________ · Cargo o relación con la organización: ______________________ ·
              Fecha: ____________
            </p>
          </div>

          <div class="panel prose">
            <h3>1. Datos generales</h3>
            {o.tamano ? (
              <Dato
                t="Tamaño"
                v={`${fmtN(o.tamano[0])} ${UNIDADES_TAMANO[o.tamano_unidad ?? 'afiliacion'].l} (${o.tamano[1]})`}
                c={o.tamano[2]}
              />
            ) : null}
            <Dato t="Fundación" v={[o.fundacion, o.pais].filter(Boolean).join(' · ') || '—'} />
            {o.poder_formal ? <Dato t="Poder formal (según estatutos)" v={o.poder_formal} /> : null}
            {o.poder_real ? <Dato t="Dónde reside el poder realmente" v={o.poder_real} /> : null}
          </div>

          <div class="panel prose">
            <h3>2. Órganos y quién elige a quién</h3>
            <p>
              De esto se calcula cuántos «saltos» hay entre la afiliación y la dirección. {REGLA_CIMA} Comprueba
              sobre todo quién elige a cada órgano y si la cima es la correcta.
            </p>
            <table class="rv-org">
              <thead>
                <tr>
                  <th>Órgano</th>
                  <th>Lo elige</th>
                  <th>Cómo decide / cada cuánto</th>
                  <th>¿Correcto?</th>
                </tr>
              </thead>
              <tbody>
                {o.organos.map((n) => (
                  <tr>
                    <td>
                      <b>{n.n}</b>
                      {n.cima ? <span class="tag">cima</span> : null}
                      {n.desc ? <div class="muted">{n.desc}</div> : null}
                    </td>
                    <td>{n.tipo === 'base' ? '(base)' : (n.elegido_por ?? []).map(nombre).join(', ') || '—'}</td>
                    <td>
                      {n.decide ? <div>{n.decide}</div> : null}
                      {n.freq ? <div>{n.freq}</div> : null}
                    </td>
                    <td class="rv-box">☐ Sí ☐ No</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p class="rv-lines">¿Falta algún órgano o alguna relación? ¿Es otra la cima?</p>
          </div>

          <div class="panel prose">
            <h3>3. Frecuencia de reuniones</h3>
            <Frecuencia
              o={o}
              k="freq_intermedio_meses"
              n="3.1"
              t="Frecuencia del órgano intermedio"
              q="¿Cada cuántos meses se reúne el órgano entre la base y la dirección (pleno, consejo, comité federal…)?"
            />
            <Frecuencia
              o={o}
              k="freq_soberano_meses"
              n="3.2"
              t="Frecuencia del órgano soberano"
              q="¿Cada cuántos meses se reúne el órgano máximo (congreso, asamblea general…)?"
            />
          </div>

          <div class="panel prose">
            <h3>4. Características codificadas</h3>
            {grupos.map(({ g, vars }) => (
              <>
                <h4 class="rv-grp">{LABEL_REVISION[g] ?? GRUPO_LABEL[g]}</h4>
                {vars.map((v) => {
                  let c = codigo(o, v.k)
                  let marcado = c ? Math.round(c[0]) : null
                  return (
                    <div class="rv-item">
                      <div class="rv-head">
                        <b>{v.l}</b>
                        <Conf c={c?.[2]} />
                      </div>
                      <ul class="rv-anchors">
                        {v.a.map((a, i) => (
                          <li class={i === marcado ? 'on' : undefined}>
                            {i === marcado ? '●' : '○'} {i} {a || '(entre la anterior y la siguiente)'}
                          </li>
                        ))}
                      </ul>
                      {v.nota ? <p class="muted">{v.nota}</p> : null}
                      <p>{c ? `Por qué: ${c[1]}` : 'Sin codificar.'}</p>
                      <Check />
                    </div>
                  )
                })}
              </>
            ))}
          </div>

          {o.problemas?.length ? (
            <div class="panel prose">
              <h3>5. Problemas que hemos detectado</h3>
              {o.problemas.map((p) => (
                <div class="rv-item">
                  <p>{p.x}</p>
                  <div class="rv-check">
                    <span class="rv-box">☐ De acuerdo</span>
                    <span class="rv-box">☐ En desacuerdo</span>
                    <span class="rv-lines">Comentario:</span>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {o.fuentes?.length ? (
            <div class="panel prose">
              <h3>6. Fuentes usadas</h3>
              <ul>
                {o.fuentes.map((f) => (
                  <li>
                    {f.t} <span class="rv-url">{f.u}</span>
                  </li>
                ))}
              </ul>
              <p class="rv-lines">¿Conoces otra fuente mejor (estatutos actualizados, actas, estudios)?</p>
            </div>
          ) : null}
        </section>
      </Document>
    )
  }
}

export function RevisionIndexPage(handle: Handle<{ orgs: Org[] }>) {
  return () => {
    let orgs = [...handle.props.orgs].sort((a, b) => a.siglas.localeCompare(b.siglas, 'es'))
    return (
      <Document seccion="metodo" title="Fichas de revisión">
        <section class="view">
          <div class="panel prose">
            <h2>Fichas de revisión</h2>
            <p>
              Una ficha imprimible por organización con todos los datos codificados, sus opciones y su justificación,
              para que alguien que conozca la organización por dentro marque qué es correcto y qué no. Imprímela o
              guárdala como PDF desde el navegador.
            </p>
            <ul class="rv-index">
              {orgs.map((o) => (
                <li>
                  <a href={routes.organizaciones.revision.href({ id: o.id })}>
                    <b>{o.siglas}</b> · {o.nombre}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </Document>
    )
  }
}
