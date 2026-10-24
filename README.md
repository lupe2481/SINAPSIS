# SINAPSIS

Visualización interactiva de feminicidios registrados y percepción femenina de inseguridad en México, 2015–septiembre de 2026.

## Vista local

Desde esta carpeta: `python3 -m http.server 5173 --directory dist`.
Abrir http://localhost:5173. No requiere compilación.

## Datos

- `dist/data.json`: conteos por año y entidad y serie de percepción nacional.
- `scripts/prepare_data.py`: agrega exclusivamente Feminicidio / Mujer, conserva los 32 estados, contrasta los totales 2015–2025 con el informe y añade las cifras estatales de 2026 transcritas de la página 11.
- SESNSP: base histórica estatal actualizada en septiembre de 2026. El corte de 2026 incluye enero–septiembre. Cambio metodológico en enero de 2026.
- INEGI: ENVIPE 2026, presentación nacional, página 38. Mujeres de 18 años y más que perciben inseguridad en su entidad. Indicador nacional, incluso en vista estatal. Referencia temporal de percepción en el mismo año de la encuesta.
- Cada punto es una unidad de un agregado, sin identidad individual. Los puntos no son personas identificadas ni las conexiones relaciones entre ellas.
- La mancha roja afecta la proporción del conjunto de puntos correspondiente al indicador. No implica que las víctimas sean la población de la encuesta.
- Yo te nombro se enlaza como documentación ciudadana complementaria, sin mezclar universos estadísticos.

Fuentes completas en el diálogo de metodología de la aplicación.

## Tipografía y visual

Allteco: archivo proporcionado por la usuaria, aplicado a título, cifras, estados y botones de navegación. Mozaic Geo Variable: proyecto Adobe Fonts `nzm4rzc`, peso variable 400. SVG neuronal proporcionado por la usuaria. Se rasteriza en memoria para ubicar puntos sobre las fibras; no se transforma el archivo original.

## Cámara

MediaPipe GestureRecognizer 0.10.21; carga bajo demanda de jsDelivr y modelo oficial de Google. Palma abierta revela la capa; puño cerrado la oculta. El cambio de año exige un nuevo ciclo puño/palma. Video local, sin almacenamiento ni envío de fotogramas. Se apaga al salir u ocultar la pestaña. Requiere HTTPS o localhost y autorización del navegador. La alternativa manual permite explorar sin cámara.

## Verificación

`node --check dist/app.js`
`node scripts/validate.mjs`

Revisión visual y funcional en el navegador: nacional, agrupaciones, Nuevo León, 2015/2025/2026, percepción manual, reinicio de la capa y metodología. Reconocimiento físico de gestos pendiente de prueba con cámara autorizada.

## Animación acumulativa

Los puntos conservan radio, tono y posición al avanzar la línea del tiempo. Solo los registros nuevos entran desde los bordes con velocidad, estelas y colisiones elásticas. Los registros ya asentados actúan como obstáculos fijos. Al retroceder se ocultan los años posteriores. Se usan 12 tonos fijos, compartidos entre puntos y fibras, con una leyenda por año. El trazado SVG se divide en capas persistentes; un pulso luminoso recorre todas las fibras activas cada 1,45 segundos. La pausa y la preferencia de movimiento reducido detienen los pulsos y las colisiones.

Verificación adicional: `node scripts/motion.test.mjs` comprueba persistencia, incorporación acumulativa, rebotes entre partículas, rebotes contra partículas retenidas, asentamiento y movimiento reducido. Referencia de movimiento: video proporcionado por la usuaria el 23 de octubre de 2026.

Al seleccionar una entidad, la cámara gráfica amplía 2,7 veces una región del tejido. Cada entidad usa un recorte estable y sus puntos se distribuyen sobre las fibras de ese recorte. La vista de las 32 entidades conserva las miniaturas completas para orientarse.

### Movimiento y percepción
Atlas plano sin rotación ni perspectiva 3D. El pellizco y el desplazamiento del touchpad, o la rueda del mouse, controlan el zoom sobre el cursor. Al ampliar, arrastrar desplaza la red dentro de límites que evitan perderla fuera de pantalla. Las teclas +/− funcionan con la red enfocada; ↺ restablece la vista. Los pulsos y la animación de entrada se conservan. La mancha nace detrás del centro y atenúa los puntos sin ocultarlos.

El tejido respira y se desplaza suavemente en 2D, sin perspectiva ni rotación. La pausa congela esta animación; movimiento reducido la desactiva. En las fichas estatales se muestran nombres ficticios estables, rotulados como demostración y separados de la base factual y su descarga.

La vista Casos documentados integra los dos mapas originales enlazados por Yo te nombro, con atribución y enlaces directos. Sus fichas se consultan en el mapa incrustado, sin copiar ni mezclar sus casos con los conteos oficiales. Requiere conexión a Google My Maps. El atlas incorpora ondas planas continuas sobre el tejido completo, incluidas las líneas de fondo, con fichas alineadas al desplazamiento.
