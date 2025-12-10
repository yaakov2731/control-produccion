/**
 * CODIGO DE GOOGLE APPS SCRIPT
 * Version: 2.0 - Dashboard & Professional Edition
 * 
 * INSTRUCCIONES DE DESPLIEGUE:
 * 1. Pega este código en https://script.google.com/
 * 2. Dale click al icono de "+" (Nueva implementación) -> Tipo: "Aplicación web".
 * 3. Ejecutar como: "Yo".
 * 4. Quién tiene acceso: "Cualquiera" (Anyone).
 * 5. Dale "Implementar" y copia la URL resultante.
 */

const SHEET_NAME = 'Datos_Crudos';
const DASHBOARD_NAME = '📊 DASHBOARD_GERENCIAL';

function doPost(e) {
    const lock = LockService.getScriptLock();
    lock.tryLock(10000); // Esperar hasta 10s para evitar condiciones de carrera

    try {
        const doc = SpreadsheetApp.getActiveSpreadsheet();
        const sheet = getOrCreateSheet(doc, SHEET_NAME);

        // Si es la primera vez, configuramos headers
        if (sheet.getLastRow() === 0) setupHeaders(sheet);

        const data = JSON.parse(e.postData.contents);

        // Validación básica
        if (!data.local || !data.pesoInicial) {
            return jsonResponse({ success: false, error: "Datos incompletos" });
        }

        const timestamp = new Date(); // Timestamp servidor
        const pesoInicial = parseFloat(data.pesoInicial) || 0;
        const pesoFinal = parseFloat(data.pesoFinal) || 0;
        const cantidad = parseInt(data.cantidad) || 0;

        // Cálculos Backend (doble verificación)
        const mermaKg = pesoInicial - pesoFinal;
        const mermaPct = pesoInicial > 0 ? (mermaKg / pesoInicial) : 0; // Guardamos en decimal (0.15 para 15%)
        const rendimientoPct = pesoInicial > 0 ? (pesoFinal / pesoInicial) : 0;
        const pesoUnidad = cantidad > 0 ? (pesoFinal / cantidad) : 0;

        // Insertar Fila
        sheet.appendRow([
            data.local,
            timestamp,
            data.responsable,
            data.categoria,
            data.insumo,
            pesoInicial,
            data.producto,
            cantidad,
            pesoFinal,
            mermaKg,
            mermaPct,       // K
            rendimientoPct, // L
            pesoUnidad,
            data.observaciones || ''
        ]);

        return jsonResponse({ success: true, message: 'Registro exitoso' });

    } catch (error) {
        return jsonResponse({ success: false, error: error.toString() });
    } finally {
        lock.releaseLock();
    }
}

function setupHeaders(sheet) {
    const headers = [
        '📍 Local', '🕒 Timestamp', '👤 Responsable', '📂 Categoría', '🥩 Insumo',
        '⚖️ Peso Inicial (Kg)', '📦 Producto', '🔢 Cantidad', '✅ Peso Final (Kg)',
        '📉 Merma (Kg)', '📉 Merma (%)', '📈 Rendimiento (%)', '⚖️ Peso/Unidad (Kg)', '📝 Observaciones'
    ];

    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

    // Formato Headers
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#1e1e2d').setFontColor('#ffffff').setFontWeight('bold').setHorizontalAlignment('center');
    sheet.setFrozenRows(1);

    // Formato Columnas
    sheet.getRange("K:L").setNumberFormat("0.0%"); // Porcentajes
    sheet.getRange("F:F").setNumberFormat("0.000"); // Pesos
    sheet.getRange("I:J").setNumberFormat("0.000"); // Pesos
    sheet.getRange("M:M").setNumberFormat("0.000"); // Pesos
}

/**
 * FUNCIÓN PRINCIPAL PARA EL USUARIO
 * Ejecutar esto restaurará o creará el Dashboard
 */
function CREAR_DASHBOARD_PROFESIONAL() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let dash = ss.getSheetByName(DASHBOARD_NAME);

    // Si existe, lo borramos para regenerar limpio (o podrías limpiarlo)
    if (dash) {
        ss.deleteSheet(dash);
    }

    dash = ss.insertSheet(DASHBOARD_NAME, 0); // Crear al principio
    dash.setTabColor("#6c5ce7");

    // Ocultar lineas de cuadricula
    dash.setHiddenGridlines(true);

    // 1. TITULO
    const titleCell = dash.getRange("B2");
    titleCell.setValue("🚀 CONTROL DE PRODUCCIÓN - DASHBOARD GERENCIAL");
    titleCell.setFontSize(18).setFontWeight("bold").setFontColor("#2d3436");

    // 2. KPIS CARDS (Fila 4)
    createKpiCard(dash, 4, 2, "PRODUCCIÓN TOTAL", "=SUM(Datos_Crudos!F:F)", "#0984e3", "0.0 kg");
    createKpiCard(dash, 4, 5, "MERMA GLOBAL", "=AVERAGE(Datos_Crudos!K:K)", "#d63031", "0.0%");
    createKpiCard(dash, 4, 8, "RENDIMIENTO PROM.", "=AVERAGE(Datos_Crudos!L:L)", "#00b894", "0.0%");

    // 3. TABLA RESUMEN POR LOCAL (Fila 8)
    // Usamos QUERY para dinamismo. Nota: Asegurate que tu sheet se llame Datos_Crudos
    const queryCell = dash.getRange("B8");
    queryCell.setValue("=QUERY(Datos_Crudos!A:M; \"SELECT A, COUNT(A), SUM(F), AVG(K), AVG(L) WHERE A IS NOT NULL GROUP BY A LABEL A 'Local', COUNT(A) 'Registros', SUM(F) 'Input Total (kg)', AVG(K) 'Merma %', AVG(L) 'Rendimiento %' FORMAT SUM(F) '0.0', AVG(K) '0.0%', AVG(L) '0.0%'\"; 1)");

    // Estilar la tabla resultante (estimado B8:F13)
    dash.getRange("B8:F8").setBackground("#636e72").setFontColor("white").setFontWeight("bold");
    dash.getRange("B8:F15").setHorizontalAlignment("center").setBorder(true, true, true, true, true, true, "#b2bec3", SpreadsheetApp.BorderStyle.SOLID);

    // 4. GENERAR GRÁFICO (Chart)
    const chart = dash.newChart()
        .setChartType(Charts.ChartType.COLUMN)
        .addRange(dash.getRange("B8:B13")) // Locales
        .addRange(dash.getRange("F8:F13")) // Rendimiento
        .setPosition(8, 8, 0, 0)
        .setOption('title', 'Rendimiento Promedio por Local')
        .setOption('colors', ['#00b894'])
        .setOption('legend', { position: 'none' })
        .build();

    dash.insertChart(chart);

    SpreadsheetApp.getUi().alert("✅ Dashboard Generado con Éxito. Revisa la pestaña '" + DASHBOARD_NAME + "'.");
}

function createKpiCard(sheet, row, col, title, formula, color, format) {
    // Header
    const rHeader = sheet.getRange(row, col, 1, 2);
    rHeader.merge().setValue(title).setBackground(color).setFontColor("white").setFontWeight("bold").setHorizontalAlignment("center");

    // Body
    const rBody = sheet.getRange(row + 1, col, 2, 2);
    rBody.merge().setFormula(formula).setNumberFormat(format).setFontSize(20).setHorizontalAlignment("center").setVerticalAlignment("middle");
    rBody.setBorder(true, true, true, true, true, true, color, SpreadsheetApp.BorderStyle.SOLID);
}

function getOrCreateSheet(ss, name) {
    let sheet = ss.getSheetByName(name);
    if (!sheet) sheet = ss.insertSheet(name);
    return sheet;
}

function jsonResponse(data) {
    return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
