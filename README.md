# SINAPSIS

Visualización interactiva de feminicidios registrados y percepción femenina de inseguridad en México, 2015–septiembre de 2026.

## Vista local

Desde esta carpeta: `python3 -m http.server 5173 --directory .`.
Abrir http://localhost:5173/index.html. No requiere compilación.

- `index.html`: primera pantalla / bienvenida.
- `experiencia.html`: atlas interactivo, con `main.js` y sus módulos.
- `reflexion.html`: reflexión y cuatro etapas del proceso, con `recursos/js/reflexion.js`.
- `estilo.css`: estilos compartidos.

Cada página funciona por URL directa. La navegación usa enlaces relativos. Al volver desde la reflexión, `experiencia.html?continuar=1` recupera año, entidad, filtro y pausa guardados en la sesión; entrar desde la bienvenida inicia el atlas en su estado predeterminado.

## Organización

Los cinco archivos principales están en la raíz. `recursos/assets/` contiene imágenes y tipografías, `recursos/js/` los módulos auxiliares, `recursos/data.json` los datos y `recursos/herramientas/` las pruebas y preparación de datos. Para compartir el sitio, incluye los cinco archivos y la carpeta `recursos` completa.

## Datos

- `recursos/data.json`: conteos por año y entidad y serie de percepción nacional.
- `recursos/herramientas/prepare_data.py`: agrega exclusivamente Feminicidio / Mujer, conserva los 32 estados, contrasta los totales 2015–2025 con el informe y añade las cifras estatales de 2026 transcritas de la página 11.
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

`node --check main.js`
`node recursos/herramientas/validate.mjs`

Revisión visual y funcional en el navegador: nacional, agrupaciones, Nuevo León, 2015/2025/2026, percepción manual, reinicio de la capa y metodología. Reconocimiento físico de gestos pendiente de prueba con cámara autorizada.

## Animación acumulativa

Los puntos conservan radio, tono y posición al avanzar la línea del tiempo. Solo los registros nuevos entran desde los bordes con velocidad, estelas y colisiones elásticas. Los registros ya asentados actúan como obstáculos fijos. Al retroceder, los años posteriores recorren en reversa su trayectoria de entrada, incluidas las colisiones, y salen del tejido. Se usan 12 tonos fijos, compartidos entre puntos y fibras, con una leyenda por año. El trazado SVG se divide en capas persistentes; un pulso luminoso recorre todas las fibras activas cada 1,45 segundos. La pausa y la preferencia de movimiento reducido detienen los pulsos y las colisiones.

Verificación adicional: `node recursos/herramientas/motion.test.mjs` comprueba persistencia, incorporación acumulativa, rebotes entre partículas, rebotes contra partículas retenidas, asentamiento y movimiento reducido. Referencia de movimiento: video proporcionado por la usuaria el 23 de octubre de 2026.

Al seleccionar una entidad, la cámara gráfica amplía 2,7 veces una región del tejido. Cada entidad usa un recorte estable y sus puntos se distribuyen sobre las fibras de ese recorte. La vista de las 32 entidades conserva las miniaturas completas para orientarse.

### Movimiento y percepción
Atlas plano sin rotación ni perspectiva 3D. El pellizco y el desplazamiento del touchpad, o la rueda del mouse, controlan el zoom sobre el cursor. Al ampliar, arrastrar desplaza la red dentro de límites que evitan perderla fuera de pantalla. Las teclas +/− funcionan con la red enfocada; ↺ restablece la vista. Los pulsos y la animación de entrada se conservan. La mancha nace detrás del centro y atenúa los puntos sin ocultarlos.

El tejido respira y se desplaza suavemente en 2D, sin perspectiva ni rotación. La pausa congela esta animación; movimiento reducido la desactiva. Los nombres reales incorporados se documentan en la sección Nombres dentro del atlas.

### Nombres dentro del atlas
Se retiraron la tercera pestaña y los mapas incrustados. Cinco casos de 2016 fueron verificados manualmente en las fichas públicas de Yo te nombro y se muestran como puntos con contorno en el tejido existente. `recursos/js/documented.js` conserva nombre, entidad, municipio, año y referencia. No son unidades identificadas del SESNSP ni se suman a los contadores. Se retiraron los nombres ficticios. La descarga KML pública devolvió HTTP 403; no se importó la base completa.

### Prueba de nombres y lectura
Los puntos agregados muestran alias ficticios estables en ambos modos, con nota discreta de 8 px. Los cinco nombres reales conservan su fuente. Los alias no se exportan como datos oficiales. La ondulación y respiración avanzan al 20% de su velocidad anterior; al consultar una ficha se congelan el tejido y la entrada de partículas, mientras la luz continúa. Una tolerancia de selección evita perder el punto por movimientos pequeños del cursor. Escape cierra la ficha.

### Tercera pantalla: reflexión y proceso
Desde «Reflexión», un botón negro con borde y texto rojos en la barra inferior del atlas, separado de «Fuentes» (borde blanco y fondo negro) se abre el cierre: reflexión completa, textura neuronal a baja opacidad y cuatro accesos circulares numerados con contorno blanco y halo rojo al interactuar. Cada círculo abre una ventana modal sobre la reflexión, que permanece visible detrás con desenfoque. Permite avanzar, retroceder y cerrar con ×, Escape o clic fuera; el foco vuelve al botón de origen. Los círculos retoman el lenguaje visual de los casos del atlas. Se mantienen Allteco y Mozaic Geo. En móvil, los círculos aparecen debajo de la lectura.

Al navegar a la reflexión se abandona la página del atlas y se apaga la cámara. Volver al atlas conserva la selección; volver al inicio recupera la bienvenida. Verificación en Chrome: cuatro etapas, retorno a reflexión, Escape, conservación del año, retorno al inicio, ancho móvil de 390 px y ausencia de errores JavaScript. Capturas en `recursos/qa/closing-desktop.png`, `recursos/qa/process-desktop.png` y `recursos/qa/closing-mobile.png`.

Verificación de páginas independientes: enlaces de ida y vuelta, acceso directo a los tres HTML, cuatro diálogos, Fuentes, restauración de año/entidad/filtro y ancho móvil sin desbordamiento. Ocho pruebas de lógica aprobadas.
