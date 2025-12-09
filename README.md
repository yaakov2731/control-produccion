# Sistema de Control de Producción Gastronómico

Este sistema permite el registro y control de producción para la cadena de locales gastronómicos. Incluye cálculo automático de mermas y rendimientos, y visualización de historial.

## 🚀 Despliegue (Deploy)

### 1. GitHub Pages
Esta aplicación web se sirve automáticamente a través de GitHub Pages.
URL: **https://[TU_USUARIO].github.io/control-produccion/**

### 2. Configuración Backend (Google Sheets)
Para que el sistema funcione y guarde datos:

1. Crea una nueva Hoja de Cálculo de Google.
2. Ve a `Extensiones > Apps Script`.
3. Copia el contenido de `google_apps_script.js` y pégalo en el editor.
4. Ejecuta la función `setupSheet()` una vez para crear la estructura.
5. Haz clic en `Implementar` > `Nueva implementación`.
6. Selecciona tipo: `Aplicación web`.
7. Configura:
   - Ejecutar como: `Yo`.
   - Quién tiene acceso: `Cualquier persona` (IMPORTANTE).
8. Copia la **URL de la aplicación web** generada.
9. Edita el archivo `js/config.js` en este repositorio y pega la URL en `SCRIPT_URL`.
10. Pega la URL de tu Spreadsheet en `SHEET_URL` y copia el ID de la hoja para `SHEET_CSV_URL`.

## 📱 Uso
1. Abre la URL en cualquier dispositivo (PC, Tablet, Celular).
2. Completa el formulario de producción.
3. Observa los cálculos en tiempo real (Merma, Rendimiento).
4. Guarda el registro.

## 🛠 Tecnologías
- HTML5 / CSS3 (Animaciones y Grid)
- JavaScript Vanilla
- Google Apps Script (Backend serverless)
