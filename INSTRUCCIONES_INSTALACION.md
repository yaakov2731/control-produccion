# GUÍA DE INSTALACIÓN Y REPARACIÓN

Sigue estos pasos para reparar la conexión y activar el nuevo Dashboard Profesional.

## PASO 1: Actualizar el Script en Google (Nube)

1. Ve a tu Google Drive y abre tu Hoja de Cálculo (o crea una nueva).
2. Ve al menú **Extensiones > Apps Script**.
3. Borra todo el código que haya allí.
4. Abre el archivo `google_apps_script.js` de esta carpeta, copia TODO el contenido y pégalo en el editor online.
5. Presiona el icono de **Guardar** (Disquette).

## PASO 2: Generar el Dashboard
1. En el editor de Apps Script, asegúrate que en la barra de arriba esté seleccionada la función `CREAR_DASHBOARD_PROFESIONAL`.
2. Dale al botón **Ejecutar**.
3. Acepta los permisos (Revisar permisos > Tu cuenta > Configuración avanzada > Ir a ... (no seguro) > Permitir).
4. **¡Listo!** Revisa tu Google Sheet, ahora deberías tener una pestaña `📂 Datos_Crudos` y `📊 DASHBOARD_GERENCIAL`.

## PASO 3: Desplegar la Web App (¡Importante!)
Para que la app conecte, debes desplegar correctamente:
1. En Apps Script, clic en **Implementar (Deploy) > Nueva implementación**.
2. Selecciona el engranaje ⚙️ > **Aplicación web**.
3. Configura así:
   - **Descripción**: v2
   - **Ejecutar como**: `Yo` (tu email).
   - **Quién tiene acceso**: `Cualquiera` (Anyone). **<-- ESTO ES FUNDAMENTAL**
4. Dale a **Implementar**.
5. **COPIA la URL** que te da al final (termina en `/exec`).

## PASO 4: Conectar tu Proyecto Local
1. Abre el archivo `js/config.js` en esta carpeta.
2. Reemplaza el valor de `SCRIPT_URL` con la URL que acabas de copiar.
3. Guarda el archivo.
4. Abre `index.html` y prueba enviar un registro.

¡Ahora tendrás datos profesionales y conexión estable!
