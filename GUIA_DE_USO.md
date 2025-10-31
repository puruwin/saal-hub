# Guía de Uso - Sistema de Gestión de Menús

## 📖 Introducción

Bienvenido al **Sistema de Gestión de Menús**, una herramienta diseñada para facilitar la planificación, consulta y administración de menús diarios con información detallada sobre alérgenos.

### ¿Para quién es esta guía?

Esta guía está dirigida a:
- **Cocineros** - Consultar menús diarios y alérgenos
- **Administradores de cocina** - Crear, editar y gestionar menús

### ¿Qué puedes hacer con este sistema?

✅ Ver menús de cualquier día en una vista de kiosco  
✅ Ver qué alérgenos contiene cada plato  
✅ Crear y editar menús en vista semanal o diaria  
✅ Importar menús de SKEs completas de una vez  
✅ Usar autocompletado con plantillas de platos frecuentes  
✅ Borrar menús de un rango de fechas  
✅ Navegar entre semanas

---

## 🔑 Acceso al Sistema

### Para administradores (Dashboard)

**URL**: `http://[dirección-servidor]/dashboard`

1. En la página principal verás un formulario de login
2. Introduce tu **nombre de usuario**
3. Introduce tu **contraseña**
4. Pulsa **"Iniciar sesión"**

Las credenciales las proporcionará TO-DO

> 💡 **Importante**: La sesión dura 1 hora. Después deberás volver a iniciar sesión.

### Para consulta pública (Kiosco)

**URL**: `http://[dirección-servidor]/menu` o `/kiosk`

- No requiere login
- Muestra automáticamente el menú del día actual
- Se actualiza cada 5 minutos automáticamente
- Ideal para pantallas en comedor o cocina

---

## 🎛️ Dashboard (Panel de Administración)

Una vez inicias sesión, accedes al Dashboard donde puedes gestionar todos los menús.

### Dos modos de vista

El Dashboard tiene **dos pestañas** en la parte superior:

1. **Vista Semanal** - Tabla con menús de toda la semana
2. **Editor Diario** - Edición detallada de un día específico

---

## 📅 Vista Semanal

### ¿Qué verás?

Una **tabla** que muestra:
- **6 filas** (Lunes a Viernes + Fin de semana unificado)
- **4 columnas**: Día, Desayuno, Comida, Cena, Acciones
- Los platos de cada comida con sus alérgenos

> 📌 **Nota**: El sábado y domingo comparten el mismo menú ("Fin de semana")

### Navegación entre semanas

En la parte superior verás controles para:
- **Semana Anterior** ← (flecha izquierda)
- **Semana actual** (centro)
- **Semana Siguiente** → (flecha derecha)
- **Ir a Semana Actual** (si estás en otra semana)

### Botones principales

En la esquina superior derecha:
- **🔄 Recargar** - Actualiza los menús desde el servidor
- **🗑️ Borrar Menús** - Elimina menús en bloque (abre modal)
- **📤 Importar Menú** - Importa menús masivamente (abre modal)

### Botones por día

Cada día tiene dos botones:
- **✏️ Editar Día** (verde) - Abre el editor de ese día específico
- **👁️ Ver Menú** (azul) - Abre vista de impresión en nueva pestaña

### Editar platos directamente en la tabla

Puedes editar el **nombre** de un plato haciendo clic sobre él:
1. Pulsa sobre el nombre del plato
2. Aparecerá un campo de texto
3. Edita el nombre
4. Pulsa Enter o haz clic fuera para guardar
5. Pulsa Escape para cancelar

> ⚠️ **Limitación**: Solo puedes cambiar el nombre, no los alérgenos desde aquí. Para cambiar alérgenos usa "Editar Día".

---

## ✏️ Editor Diario

### ¿Cómo acceder?

Hay dos formas:
1. Desde **Vista Semanal** → Pulsar "✏️ Editar Día" en cualquier día
2. Desde la pestaña **"Editor Diario"** en el Dashboard → Seleccionar fecha

### ¿Qué verás?

Una vista enfocada en un solo día con:
- **Nombre del día** y fecha en la parte superior
- **Tres secciones** (Desayuno, Comida, Cena)
- **Botón "Ver Menú del Día"** (para abrir vista de impresión)

### Agregar un plato

**Pasos:**

1. En la sección deseada (Desayuno/Comida/Cena), pulsa **"+ Agregar plato"**

2. Se abrirá un formulario con:
   - **Campo de nombre**: Empieza a escribir el nombre del plato
   - **Sugerencias automáticas**: Si escribes 2+ caracteres, aparecerán sugerencias
   - **Botones de alérgenos**: 14 botones con iconos para marcar alérgenos

3. **Usar autocompletado** (recomendado):
   - Escribe: "Pae..."
   - Aparecen sugerencias: "Paella Valenciana", "Paella de verduras", etc.
   - Pulsa sobre la sugerencia que quieras
   - Los alérgenos se rellenan automáticamente
   - Puedes modificar los alérgenos si es necesario

4. **Navegación del autocompletado**:
   - **Flecha ▼**: Bajar en la lista
   - **Flecha ▲**: Subir en la lista  
   - **Enter**: Seleccionar sugerencia resaltada
   - **Escape**: Cerrar sugerencias

5. **Seleccionar alérgenos**:
   - Pulsa los botones de alérgenos que correspondan
   - Los seleccionados se marcan en rojo
   - Puedes seleccionar múltiples

6. **Guardar**:
   - Pulsa **"Agregar"** (verde)
   - O **"Cancelar"** para descartar

### Eliminar un plato

1. Busca el plato en la lista
2. Pulsa la **✕** (cruz roja) a la derecha del plato
3. Se eliminará inmediatamente

### Entender los alérgenos

Cada plato muestra sus alérgenos con **iconos** y **texto**. Los alérgenos disponibles son:

| Icono | Alérgeno | Ejemplos |
|-------|----------|----------|
| <img src="./src/assets/gluten.svg" alt="Gluten" width="30"> | Gluten | Pan, pasta, harina de trigo |
| <img src="./src/assets/lacteos.svg" alt="Lácteos" width="30"> | Lácteos | Leche, queso, yogur, mantequilla |
| <img src="./src/assets/huevos.svg" alt="Huevos" width="30"> | Huevos | Tortillas, mayonesa, rebozados |
| <img src="./src/assets/pescado.svg" alt="Pescado" width="30"> | Pescado | Merluza, atún, salmón |
| <img src="./src/assets/crustaceos.svg" alt="Crustáceos" width="30"> | Crustáceos | Gambas, langostinos, cangrejos |
| <img src="./src/assets/frutos-cascara.svg" alt="Frutos secos" width="30"> | Frutos secos | Almendras, nueces, avellanas |
| <img src="./src/assets/cacahuetes.svg" alt="Cacahuetes" width="30"> | Cacahuetes | Cacahuetes y derivados |
| <img src="./src/assets/soja.svg" alt="Soja" width="30"> | Soja | Salsa de soja, tofu |
| <img src="./src/assets/sulfitos.svg" alt="Sulfitos" width="30"> | Sulfitos | Vino, conservas |
| <img src="./src/assets/apio.svg" alt="Apio" width="30"> | Apio | Apio fresco, caldos |
| <img src="./src/assets/sesamo.svg" alt="Sésamo" width="30"> | Sésamo | Pan con sésamo, tahini |
| <img src="./src/assets/mostaza.svg" alt="Mostaza" width="30"> | Mostaza | Salsa mostaza, aderezos |
| <img src="./src/assets/moluscos.svg" alt="Moluscos" width="30"> | Moluscos | Mejillones, almejas, calamares |
| <img src="./src/assets/altramuces.svg" alt="Altramuces" width="30"> | Altramuces | Encurtidos, snacks |

---

## 🍽️ Sistema de Plantillas

### ¿Qué son las plantillas?

Las plantillas son **platos guardados automáticamente** con sus alérgenos. Cada vez que creas un plato, se guarda como plantilla para uso futuro.

### ¿Cómo funcionan?

1. **Creación automática**: Al agregar un plato nuevo, se guarda automáticamente como plantilla
2. **Contador de uso**: Cada vez que usas una plantilla, incrementa su contador
3. **Ordenamiento inteligente**: Las sugerencias muestran primero los platos más usados
4. **Actualización automática**: Si cambias los alérgenos de un plato existente, se actualiza la plantilla

### Ejemplo práctico

**Primera vez:**
- Agregas "Paella Valenciana" con alérgenos: Gluten, Crustáceos
- Se guarda automáticamente como plantilla
- Contador de uso: 1

**Próxima vez:**
- Escribes "Pae..." en el campo de nombre
- Aparece "Paella Valenciana" en las sugerencias
- Pulsas sobre ella
- Los alérgenos Gluten y Crustáceos se rellenan automáticamente
- Contador de uso: 2

---

## 📦 Importación Masiva

### ¿Para qué sirve?

Para importar **9 semanas completas de menús** de una sola vez desde un archivo de datos.

### Requisitos previos

El archivo `menu_data.json` debe estar en la carpeta `public/` del frontend con el formato correcto.

### Proceso de importación

**Pasos:**

1. En **Vista Semanal**, pulsa el botón **"📤 Importar Menú"** (verde, arriba a la derecha)

2. Se abre un modal con el título **"Importar Menú Escolar"**

3. **Selecciona la fecha de inicio**:
   - Usa el selector de fecha
   - **⚠️ IMPORTANTE**: Debe ser un **LUNES**
   - El sistema te indica si la fecha es válida:
     - ✅ Verde si es lunes
     - ❌ Rojo si no es lunes

4. Verás una advertencia:
   - "Se importarán **9 semanas** de menús desde el archivo de datos"

5. Pulsa **"Continuar"**

6. Aparece pantalla de confirmación con:
   - Fecha de inicio
   - Semanas a importar: 9
   - Menús totales: ~63 días
   - Advertencia: "Esta acción creará una gran cantidad de menús"

7. Pulsa **"Confirmar e Importar"** (rojo)

8. Espera mientras se importan (puede tardar varios segundos)

9. Al terminar verás un mensaje con:
   - ✅ Menús creados
   - ⏭️ Menús omitidos (que ya existían)
   - ❌ Errores
   - 🍽️ Plantillas creadas/actualizadas

### ¿Qué pasa con menús existentes?

El sistema **NO sobrescribe** menús que ya existen. Si un menú ya está creado para una fecha, lo omite y continúa con el siguiente.

### Cálculo de fechas

Si seleccionas como inicio el lunes 27 de octubre de 2025:
- **Semana 0**: Del lunes 27/10 al domingo 02/11
- **Semana 1**: Del lunes 03/11 al domingo 09/11
- **Semana 2**: Del lunes 10/11 al domingo 16/11
- ... y así hasta completar 9 semanas

---

## 🗑️ Borrado Masivo

### ¿Para qué sirve?

Para eliminar todos los menús de un rango de fechas específico (útil para limpiar menús antiguos o erróneos).

### ⚠️ ADVERTENCIA

Esta acción es **IRREVERSIBLE**. No hay forma de recuperar los menús borrados.

### Proceso de borrado

**Pasos:**

1. En **Vista Semanal**, pulsa el botón **"🗑️ Borrar Menús"** (rojo, arriba a la derecha)

2. Se abre un modal con el título **"🗑️ Borrar Menús en Bloque"**

3. **Selecciona fecha de inicio**:
   - Puede ser cualquier día (no necesita ser lunes)
   - Ejemplo: 01/09/2025

4. **Selecciona fecha final**:
   - Debe ser posterior a la fecha de inicio
   - Ejemplo: 30/09/2025

5. El sistema muestra:
   - "Se borrarán aproximadamente **X días** de menús"
   - Rango completo de fechas

6. Pulsa **"Continuar"**

7. Aparece pantalla de confirmación con:
   - Detalles del borrado (desde, hasta, días)
   - Advertencia grande: **"¡ACCIÓN IRREVERSIBLE!"**
   - "Esta acción no se puede deshacer"

8. Pulsa **"Confirmar y Borrar"** (rojo)

9. Espera mientras se borran los menús

10. Al terminar verás:
    - 🗑️ Menús eliminados: X

---

## 👁️ Ver Menú (Vista de Impresión)

### ¿Qué es?

Una vista especial de un día completo, optimizada para ver en pantalla grande o imprimir.

### ¿Cómo acceder?

Hay dos formas:
1. Desde **Vista Semanal** → Pulsar "👁️ Ver Menú" en cualquier día
2. Desde **Editor Diario** → Pulsar "Ver Menú del Día"
3. URL directa: `/menu/YYYY-MM-DD` (ejemplo: `/menu/2025-10-27`)

### Características

- **Se abre en nueva pestaña** automáticamente
- **Sin barras de navegación** - Vista limpia
- **Tres columnas verticales** (Desayuno, Comida, Cena)
- **Formato paisaje** para impresión
- **Botón "Volver al Dashboard"** arriba a la izquierda

### Para imprimir

1. Abre la vista de menú del día deseado
2. Usa `Ctrl+P` (Windows) o `Cmd+P` (Mac)
3. O desde el menú del navegador: Archivo → Imprimir
4. El formato está optimizado para A4 horizontal

---

## 🔍 Casos de Uso Comunes

### Caso 1: Ver el menú de hoy rápidamente

**Situación**: Estás en la cocina y quieres ver el menú del día.

**Solución**:
1. Abre en el navegador: `http://[servidor]/menu`
2. Se muestra automáticamente el menú de hoy
3. La pantalla se actualiza sola cada 5 minutos

---

### Caso 2: Crear los menús de la próxima semana

**Situación**: Es viernes y quieres planificar la semana siguiente.

**Solución**:
1. Login en el Dashboard
2. Ve a **Vista Semanal**
3. Pulsa **"Semana Siguiente"** →
4. Para cada día que quieras crear:
   - Pulsa **"✏️ Editar Día"**
   - Agrega desayuno, comida y cena
   - Usa autocompletado para platos frecuentes
   - Vuelve atrás
5. Repite para todos los días de la semana

---

### Caso 3: Cambiar un plato porque falta un ingrediente

**Situación**: Es mediodía y te has quedado sin merluza. Necesitas cambiar "Merluza a la plancha" por "Salmón a la plancha".

**Solución rápida** (desde Vista Semanal):
1. Login en el Dashboard
2. En **Vista Semanal**, busca hoy en la tabla
3. Haz clic sobre "Merluza a la plancha"
4. Escribe "Salmón a la plancha"
5. Pulsa Enter
6. ¡Listo! El cambio se guarda automáticamente

**Solución completa** (si necesitas cambiar alérgenos):
1. Login en el Dashboard
2. Pulsa **"✏️ Editar Día"** en el día de hoy
3. Busca "Merluza a la plancha" en Comida
4. Pulsa la **✕** para eliminarlo
5. Pulsa **"+ Agregar plato"**
6. Escribe "Salmón a la plancha"
7. Marca alérgenos: Pescado
8. Pulsa **"Agregar"**

---

### Caso 4: Importar menús de todo un trimestre escolar

**Situación**: Te envían el archivo `menu_data.json` con 9 semanas de menús escolares.

**Solución**:
1. El archivo `menu_data.json` debe estar en `public/` del frontend (generalmente ya lo estará)
2. Login en el Dashboard
3. Ve a **Vista Semanal**
4. Pulsa **"📤 Importar Menú"**
5. Selecciona el **primer lunes del periodo** (ej: 3 de noviembre de 2025)
6. Verifica que sea lunes (indicador verde)
7. Pulsa **"Continuar"**
8. Lee la confirmación (63 días, 9 semanas)
9. Pulsa **"Confirmar e Importar"**
10. Espera 10-30 segundos
11. ¡Listo! Se importan automáticamente:
    - Todos los menús
    - Todas las plantillas de platos
    - Los menús que ya existían se omiten

---

### Caso 5: Limpiar menús antiguos de hace 6 meses

**Situación**: Quieres borrar los menús de marzo a mayo para mantener limpia la base de datos.

**Solución**:
1. Login en el Dashboard
2. Ve a **Vista Semanal**
3. Pulsa **"🗑️ Borrar Menús"**
4. Fecha de inicio: 01/03/2025
5. Fecha final: 31/05/2025
6. Pulsa **"Continuar"**
7. Lee la advertencia: "~92 días serán borrados"
8. Si estás seguro, pulsa **"Confirmar y Borrar"**
9. Espera unos segundos
10. ¡Listo! Los menús se han eliminado

> ⚠️ **Recuerda**: Esta acción no se puede deshacer.

---

### Caso 6: Un comensal pregunta si el plato tiene lácteos

**Situación**: Estás sirviendo y alguien pregunta si la croqueta tiene lácteos.

**Solución**:
1. Abre la vista de kiosco: `http://[servidor]/menu`
2. Busca "Croquetas" en la sección de Comida
3. Mira los iconos de alérgenos debajo del nombre
4. Si ves el icono de lácteos 🥛, contiene lácteos
5. Si NO ves el icono, NO contiene lácteos

---

## ❓ Preguntas Frecuentes

### ¿Puedo usar la aplicación desde mi móvil?

Sí, funciona en móviles, tablets y ordenadores con cualquier navegador moderno.

### ¿Los cambios se guardan automáticamente?

No, debes completar la acción (pulsar "Agregar", "Guardar", o Enter al editar). Si sales sin guardar, perderás los cambios.

### ¿Qué es el "fin de semana unificado"?

El sábado y domingo comparten el mismo menú. Esto se hace porque muchas veces el menú del fin de semana es idéntico ambos días. Cuando editas el sábado, automáticamente se aplica también al domingo.

### ¿Puedo imprimir los menús?

Sí, usa la vista "Ver Menú" que está optimizada para imprimir en A4 horizontal. Pulsa `Ctrl+P` o `Cmd+P`.

### ¿Cuánto tiempo dura la sesión de administrador?

1 hora. Después deberás iniciar sesión nuevamente.

### ¿Qué pasa si cierro el navegador mientras edito?

Perderás los cambios no guardados. Asegúrate de guardar antes de cerrar.

### ¿Puedo copiar un menú de un día a otro?

No directamente, pero puedes usar las **plantillas** con autocompletado que funcionan muy rápido. Empieza a escribir el nombre del plato y selecciónalo de las sugerencias.

### ¿Qué es el "contador de uso" en las plantillas?

Es un número que indica cuántas veces has usado ese plato. Las plantillas más usadas aparecen primero en las sugerencias.

### ¿Puedo editar una plantilla?

Las plantillas se actualizan automáticamente cuando creas o editas un plato con ese nombre y diferentes alérgenos.

### ¿Qué navegadores están soportados?

Chrome, Firefox, Safari y Edge modernos (últimas 2 versiones).

### ¿Funciona sin internet?

No, necesitas conexión al servidor donde está alojada la aplicación.

### ¿Cómo sé qué servidor usar?

Pregunta al administrador técnico la dirección IP o dominio del servidor (ejemplo: `192.168.1.100` o `menu.escuela.es`).

---

## 🆘 Solución de Problemas

### No puedo iniciar sesión

**Causas posibles:**
- Usuario o contraseña incorrectos
- El servidor no responde
- Tu sesión anterior no se cerró correctamente

**Solución:**
1. Verifica usuario y contraseña (mayúsculas/minúsculas)
2. Comprueba que la URL del servidor sea correcta
3. Intenta en modo incógnito del navegador
4. Si persiste, contacta al administrador técnico

---

### La vista de kiosco muestra "No hay menú disponible"

**Causas posibles:**
- No se creó el menú de hoy
- El servidor no responde
- Problema de conexión

**Solución:**
1. Verifica que haya menú creado para hoy (login en Dashboard)
2. Pulsa el botón "Reintentar" en la pantalla
3. Recarga la página (F5)
4. Comprueba tu conexión a internet

---

### Al importar menús dice "debe ser un LUNES"

**Causa:**
Has seleccionado un día que no es lunes.

**Solución:**
1. Mira un calendario
2. Selecciona el lunes más cercano
3. El sistema te indicará con ✅ verde cuando sea correcto

---

### Las sugerencias de platos no aparecen

**Causas posibles:**
- Has escrito menos de 2 caracteres
- No hay plantillas que coincidan
- Problema de conexión

**Solución:**
1. Escribe al menos 2 letras del nombre del plato
2. Espera 1 segundo para que aparezcan
3. Si no hay sugerencias, escribe el nombre completo manualmente

---

### No puedo eliminar un plato

**Causas posibles:**
- Problema de conexión
- Sesión caducada

**Solución:**
1. Comprueba tu conexión
2. Verifica que no haya pasado más de 1 hora desde el login
3. Si pasó 1 hora, cierra sesión y vuelve a iniciar
4. Intenta de nuevo

---

### Al navegar entre semanas no se cargan los menús

**Causa:**
Problema de conexión o el servidor tarda en responder.

**Solución:**
1. Pulsa el botón **"🔄 Recargar"** (arriba a la derecha)
2. Espera unos segundos
3. Si no funciona, recarga la página (F5)

---

## 📞 Soporte Técnico

### ¿Necesitas ayuda?

**Para problemas técnicos o de acceso:**
- Contacta al administrador del sistema
- Describe exactamente qué estabas haciendo
- Si es posible, haz una captura de pantalla

**Para dudas sobre cómo usar:**
- Consulta esta guía primero
- Busca tu caso en "Casos de Uso Comunes"
- Pregunta a un compañero que ya use el sistema

---

## 💡 Consejos y Buenas Prácticas

### Para el día a día

✅ **Deja la vista de kiosco abierta** en una tablet en la cocina  
✅ **Usa siempre el autocompletado** para ahorrar tiempo  
✅ **Crea los menús con antelación** (idealmente el viernes anterior)  
✅ **Imprime el menú semanal** y cuélgalo en la cocina como respaldo  

### Para administradores

✅ **Importa menús al inicio de cada periodo escolar** (9 semanas de una vez)  
✅ **Navega a la semana correcta antes de editar** para evitar cambiar el día equivocado  
✅ **Usa la Vista Semanal para revisiones rápidas** y el Editor Diario para creaciones detalladas  
✅ **Limpia menús antiguos** cada 6 meses con borrado masivo  
✅ **Guarda una copia del archivo menu_data.json** antes de cada importación  

### Para la seguridad

✅ **No compartas tu contraseña** con nadie  
✅ **Cierra sesión** cuando termines, especialmente en dispositivos compartidos  
✅ **Verifica siempre dos veces los alérgenos** antes de guardar un plato  
✅ **Haz un backup mental**: pregúntate "¿realmente quiero borrar esto?"** antes de confirmar borrados  

---

## 📚 Glosario

**Dashboard** - Panel de control principal donde gestionas todos los menús.

**Vista Semanal** - Tabla que muestra los menús de toda una semana de lunes a domingo.

**Editor Diario** - Vista enfocada en editar el menú de un solo día.

**Kiosco** - Vista pública de solo lectura que muestra el menú del día actual.

**Plantilla** - Plato guardado automáticamente con sus alérgenos para reutilizar.

**Autocompletado** - Sistema de sugerencias que aparece al escribir nombres de platos.

**Importación masiva** - Proceso de cargar 9 semanas de menús de una sola vez.

**Borrado masivo** - Proceso de eliminar todos los menús de un rango de fechas.

**Fin de semana unificado** - Sábado y domingo comparten el mismo menú.

**Alérgeno** - Sustancia que puede causar reacciones alérgicas (gluten, lácteos, etc.).

---

## 📖 Historial de Cambios

**Versión 1.1 - Octubre 2025**
- Documentación basada en código real del sistema
- Incluye todas las funcionalidades existentes
- Casos de uso prácticos verificados

**Versión 1.0 - Octubre 2025**
- Primera versión de la guía

---

**¿Dudas?** Consulta con el administrador del sistema.

**¡Bienvenido al sistema de gestión de menús!** 🍽️
