# ¡GOLAZO DE TILDES! EL CAMPEONATO DE LAS PALABRAS

Juego web de acentuación para 4.º grado (agudas, graves, esdrújulas y sobresdrújulas). Cuatro desafíos progresivos, 25 actividades, registro en Google Sheets y panel docente.

## Archivos

| Archivo | Para qué sirve |
|---|---|
| `index.html` | Estructura de las pantallas (ingreso, mapa, actividades, panel docente). |
| `styles.css` | Estética 3D: estadio, cancha, botones, personajes y animaciones. |
| `script.js` | Actividades, corrección interna, guardado y panel docente. |
| `google-apps-script.gs` | Código que se pega en Google Apps Script para guardar en la planilla. |
| `README.md` | Estas instrucciones. |

No usa bibliotecas externas: los efectos 3D están hechos con CSS y SVG, así funciona bien en computadoras escolares sin placa de video.

---

## Paso 1 · Crear la planilla y el registro (Google Sheets)

1. Crear una planilla nueva en Google Drive (por ejemplo, «Golazo de Tildes – Resultados»).
2. Menú **Extensiones ▸ Apps Script**. Borrar lo que aparece y pegar todo el contenido de `google-apps-script.gs`. Guardar.
3. **Clave del panel docente:** en Apps Script, ir a **Configuración del proyecto (⚙) ▸ Propiedades de la secuencia de comandos ▸ Agregar propiedad**:
   - Propiedad: `CLAVE_DOCENTE`
   - Valor: la clave que quieras (por ejemplo, una frase larga).
   La clave queda guardada en el servidor de Google, no en el código del juego.
4. Volver al editor, elegir la función `crearHojas` y tocar **Ejecutar**. Google va a pedir permisos: aceptarlos con la cuenta docente. Se crean las hojas **4.º A** y **4.º B**.
5. **Implementar ▸ Nueva implementación ▸ Tipo: Aplicación web**.
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier usuario**
   Tocar **Implementar** y copiar la **URL de la aplicación web** (termina en `/exec`).
6. Abrir `script.js` y pegar esa URL al principio:
   ```js
   const CONFIG = {
     SCRIPT_URL: 'https://script.google.com/macros/s/....../exec'
   };
   ```

> Si más adelante se modifica el código de Apps Script, hay que ir a **Implementar ▸ Gestionar implementaciones ▸ Editar ▸ Versión: Nueva** para que el cambio se aplique a la misma URL.

## Paso 2 · Publicar en GitHub Pages

1. Crear un repositorio en GitHub (por ejemplo `golazo-de-tildes`) y subir `index.html`, `styles.css` y `script.js` (con la URL ya pegada).
2. **Settings ▸ Pages ▸ Branch: main / (root) ▸ Save**.
3. A los pocos minutos el juego queda en `https://TU-USUARIO.github.io/golazo-de-tildes/`.

## Paso 3 · Probar antes de la clase

1. Entrar con `4a` y un nombre de prueba, responder dos actividades y dejar una pendiente.
2. Revisar la hoja **4.º A**: debe haber una fila por actividad (respondida o pendiente).
3. Volver a jugar con el mismo nombre: el progreso se recupera y las respuestas siguen bloqueadas.
4. Abrir **Panel docente**, escribir la clave y tocar **Ver resultados**.
5. Borrar las filas de prueba de la planilla antes de usarlo con los chicos.

---

## Cómo funciona para los estudiantes

- Ingresan **grado y división** (solo `4A` o `4B`, en mayúsculas o minúsculas) y **nombre y apellido**. No hay códigos.
- El **mapa del campeonato** muestra los 4 desafíos. Cada uno se desbloquea al terminar el anterior (aunque haya quedado algo pendiente).
- El botón **Siguiente** está siempre disponible: pueden pasar de actividad sin responderla o con la mitad hecha («¡Podés continuar! Después podés volver para completarla»). Lo que dejaron a medias queda guardado y lo encuentran igual al volver, desde los círculos numerados o desde el mapa. Los círculos naranjas marcan actividades con intentos sin resolver; las estrellas, las resueltas.
- Los acompaña **Tildo**, una pelota de fútbol con una tilde en la cabeza.
- Al confirmar una respuesta **correcta**, Tildo dice en voz alta y en pantalla **«¡Perfecto, caballero!»**, la actividad **queda bloqueada** y pasa sola a la siguiente.
- Si la respuesta tiene algún error, Tildo dice **«¡Casi, caballero!»** y pueden **volver a responder** las veces que necesiten. No se muestra cuál parte estuvo mal ni la solución.
- El progreso se guarda en la computadora y en la planilla. Si entran desde otra computadora con el mismo nombre, las actividades ya respondidas aparecen bloqueadas.
- 🔊 lee la palabra en voz alta (si la computadora tiene voz en español). El sonido se puede apagar.

> Importante: el nombre se usa para identificar a cada estudiante. Conviene pedir que lo escriban siempre igual (por ejemplo, «Sofía Pérez»). Mayúsculas, tildes y espacios de más no generan duplicados.

## Qué registra la planilla

Una fila por estudiante y actividad (sin duplicados): nombre y apellido, división, última actualización, desafío, n.º y nombre de la actividad, contenido, estado (Respondida / Sin resolver / Pendiente), fecha y hora del último intento, primera respuesta, última respuesta, respuesta correcta, resultado (por ejemplo «Correcta al primer intento», «Correcta en el intento 3», «Todavía incorrecta (2 intentos)»), cantidad de intentos, logro al primer intento (%), respondidas y pendientes del desafío, resolución del desafío (%), logro del desafío (%) y tiempo en el desafío (minutos).

Una respuesta correcta ya registrada no se puede sobrescribir desde el juego. Si la planilla se había creado con la versión anterior, los encabezados se actualizan solos (hay que pegar el nuevo `google-apps-script.gs` y crear una **nueva versión** de la implementación).

## Panel docente

Botón **Panel docente** en la pantalla de ingreso. Con la clave muestra:

- Resultados por división (4.º A, 4.º B o ambas) y buscador por nombre.
- Desempeño de cada estudiante en cada desafío (logro al primer intento y actividades resueltas) y detalle actividad por actividad con primera respuesta, última respuesta e intentos.
- Logro por contenido y actividades con mayor dificultad.
- Lista de actividades sin resolver (sin responder o con intentos incorrectos).
- Resumen general de los aprendizajes.

El botón **modo prueba** muestra solo las partidas jugadas en esa computadora (sirve para probar sin planilla).

---

## Clave de respuestas (para la docente)

### Desafío 1 · El entrenamiento del golpe de voz (sílaba tónica)
1. **Calentamiento** – «pelota»: sílaba más fuerte **lo**.
2. **Las tarjetas del vestuario** – separar: ca-mi-sa · can-ción · te-lé-fo-no.
3. **Pase al golpe de voz** – re-**LOJ** · **ÁR**-bol · **MÚ**-si-ca · pa-**PEL** · ca-**MI**-sa.
4. **Fuerte y suave** – átonas de «galleta»: **ga y ta**.
5. **¿En qué lugar de la cancha?** – canción: última · mesa: penúltima · teléfono: antepenúltima · pelota: penúltima.
6. **Desafío del VAR** – jugada mal marcada: **RE-loj** (la fuerte es «loj»).

### Desafío 2 · El VAR de las palabras (clasificación)
1. **¡A las camisetas!** – Agudas: canción, reloj · Graves: árbol, mesa · Esdrújulas: música, pájaro · Sobresdrújulas: cuéntamelo, dígaselo.
2. **Repetición en cámara lenta** – a-zú-car: grave · co-li-brí: aguda · pe-lí-cu-la: esdrújula.
3. **Contrarreloj del VAR** (el reloj no penaliza) – papel: aguda · lápiz: grave · brújula: esdrújula · sofá: aguda · explícamelo: sobresdrújula · ventana: grave.
4. **Jugador en el equipo equivocado** (equipo de graves) – **camión** (es aguda).
5. **Los carteles de la cancha** – ESTADIO: grave · GOLEADOR: aguda · PÚBLICO: esdrújula · CAMPEÓN: aguda · ¡PÁSAMELA!: sobresdrújula.
6. **El fichaje sobresdrújulo** – **llévatelo** (teléfono y murciélago son esdrújulas de 4 sílabas: distractores intencionales).

### Desafío 3 · El vestuario de las tildes (reglas)
1. **¿Lleva tilde o no?** – raton → sí (ratón) · pared → no · arbol → sí (árbol) · zapato → no · examen → no.
2. **Estampando tildes** – café · lápiz · música · camión.
3. **Subtítulos con fallas** – errores: **tómo** (tomó) y **estádio** (estadio).
4. **La explicación de la capitana** – lápiz: es grave y no termina en n, s ni vocal.
5. **La lista del vestuario** – sillón · reloj · difícil · joven · compás.
6. **Cada palabra con su regla** – sofá: aguda terminada en vocal · mesa: grave terminada en vocal, sin tilde · pájaro: esdrújula · reloj: aguda que no termina en n, s ni vocal · cómpraselo: sobresdrújula.

### Desafío 4 · La gran final (integración)
1. **La publicación de Tildo** – errores: **partído** (sobra: partido) y **arbitro** (falta: árbitro).
2. **La formación de la final** – Agudas: corazón, jamás · Graves: fútbol, cuaderno · Esdrújulas: lámpara, sábado · Sobresdrújulas: devuélvemela, entrégaselo.
3. **Carteles sin terminar** – árbitro · jugador (sin tilde) · ángel · dibújalo.
4. **¿Quién se coló en el equipo?** (agudas con tilde) – **reloj**.
5. **La pregunta del árbitro** – cantar: es aguda y no termina en n, s ni vocal.
6. **Los carteles del partido** – Último minuto · Equipo campeón · ¡Gol de cabeza! · Vestuario local.
7. **El último penal** – «pelota» sí tiene sílaba tónica: **lo** (todas las palabras tienen sílaba tónica, aunque no lleven tilde).

### Cómo se calcula el logro
El logro se calcula con el **primer intento**, porque es el que muestra qué sabía el estudiante antes de corregir. Las actividades con varios ítems dan puntaje parcial (por ejemplo, 4 de 5 palabras bien = 80 %). En «marcar errores», cada palabra marcada de más descuenta una acertada. La cantidad de intentos permite ver quién necesitó varias vueltas para llegar a la respuesta.

---

## Para editar palabras o consignas

Todo el contenido está en `script.js`, dentro de `const CHALLENGES = [...]`. Cada actividad tiene su consigna (`prompt`) y su respuesta (`answer`). Si se cambia una actividad que ya jugaron los chicos, conviene mantener su `id` y sus respuestas, o empezar una planilla nueva.

## Privacidad

Se guardan solo nombre, apellido, división y respuestas. Los datos quedan en la cuenta de Google de la docente. El panel pide la clave al servidor de Google, nunca está escrita en el código del juego.
