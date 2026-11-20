# Codificaciones independientes

Sirven para medir cuánto coincidirían dos personas que aplican el mismo libro de códigos a la misma
organización. La ficha de `data/orgs/<id>.json` es la **codificación de referencia** (la del codificador
original); aquí van las demás, una carpeta por codificador:

```
data/codificaciones/
  PLANTILLA.json            ← cópiala para cada organización
  <codificador>/<org_id>.json
  agente-claude/…           ← control por modelo de IA (más débil que una persona, ver abajo)
```

Añadir un codificador = crear su carpeta (minúsculas, sin espacios: `maria-g`, `revisor-2`) y dejar
dentro un archivo por organización. No hace falta codificarlas todas: el análisis admite cobertura
parcial. Para recalcular la fiabilidad:

```sh
cd analisis && uv run fiabilidad.py      # escribe analisis/resultados/fiabilidad.md
```

## Instrucciones para codificar

1. **A ciegas.** No abras `data/orgs/`, la web de la aplicación ni las codificaciones de otras personas
   antes de terminar. Si ya habías visto la ficha de esa organización, dilo en `notas_ceguera` y pon
   `"a_ciegas": false`.
2. **Solo con el libro de códigos y las fuentes.** El libro (variables y anclajes 0-4) está en la página
   «Método y datos» y en `app/lib/codebook.ts`. Quien coordina te da el nombre de la organización y la
   lista de fuentes; puedes buscar más. Apunta todas en `fuentes_consultadas`
   (`lista_inicial: false` las que añadas tú).
3. **Los 13 códigos manuales**, cada uno como `[valor, "justificación", "confianza"]`:
   - valor entero 0-4 (el anclaje que mejor encaja; los anclajes vacíos son intermedios). Si no hay
     base ninguna, `null` y explica por qué.
   - justificación: 1-3 frases con la fuente concreta (artículo, página, medio). Si dudaste entre dos
     valores, dilo: «entre 2 y 3: …».
   - confianza: `alta` (leído en estatutos o documento normativo), `media` (fuentes secundarias fiables),
     `baja` (estimación).
4. Codifica el **poder formal** en las 12 variables de estructura y deja para `brecha_formal_real`
   cuánto se separa de eso el poder real. Ojo con las variables invertidas: en `brecha_formal_real`
   alto = peor; en `regla_decision`, `capacidad_ejecutiva` y `coste_coordinacion` alto = más
   centralizado o con más aparato, no «más democrático».
5. No codifiques el organigrama, las frecuencias ni el tamaño: salen de la ficha de referencia y se
   calculan solos.
6. Al terminar, no corrijas tu archivo después de ver la referencia. Las discrepancias se discuten
   aparte; si de la discusión sale un cambio, va a la ficha de referencia o al libro de códigos, no aquí.

## Metadatos

| campo | qué es |
|---|---|
| `org_id` | igual que el nombre del archivo y el `id` de la ficha |
| `codificador.id` | igual que el nombre de la carpeta |
| `codificador.tipo` | `humano` o `ia` |
| `codificador.modelo` | solo si es `ia`: identificador del modelo |
| `fecha` | día en que se terminó la codificación |
| `a_ciegas`, `notas_ceguera` | si viste la referencia antes y qué |
| `fuentes_consultadas` | `{t, u, lista_inicial, leida}` |

## Sobre `agente-claude`

Son codificaciones hechas por subagentes de un modelo de IA que solo recibieron el libro de códigos, el
nombre de la organización y la lista de fuentes de la ficha. Sirven para detectar anclajes ambiguos y
errores gruesos, pero no sustituyen a un segundo codificador humano: el modelo comparte sesgos de
lectura con quien lo usa para redactar, parte de las mismas fuentes y puede haber visto en su
entrenamiento textos parecidos a las fichas.
