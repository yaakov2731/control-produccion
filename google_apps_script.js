/**
 * CODIGO DE GOOGLE APPS SCRIPT
 * Copia y pega este contenido en tu editor de script de Google Sheet.
 * Asegúrate de publicar como aplicación web con acceso "Cualquiera" (incluyendo anónimos).
 */

const SHEET_NAME = 'Datos_Crudos';
const FORM_SHEET_NAME = 'Formulario_App'; // Nombre amigable para usuario final si lo prefiere

function doPost(e) {
    // Manejo de CORS simplificado
    try {
        const data = JSON.parse(e.postData.contents);
        const sheet = getOrCreateSheet();

        // Auto-formatting si es la primera fila
        if (sheet.getLastRow() === 0) setupSheet();

        // Parseo seguro de números
        const pesoInicial = parseFloat(data.pesoInicial) || 0;
        const pesoFinal = parseFloat(data.pesoFinal) || 0;
        const cantidad = parseInt(data.cantidad) || 0;

        const mermaKg = pesoInicial - pesoFinal;
        const mermaPct = pesoInicial > 0 ? ((mermaKg / pesoInicial) * 100).toFixed(2) : 0;
        const rendimientoPct = pesoInicial > 0 ? ((pesoFinal / pesoInicial) * 100).toFixed(2) : 0;
        const pesoUnidad = cantidad > 0 ? (pesoFinal / cantidad).toFixed(3) : 0;

        const timestamp = Utilities.formatDate(
            new Date(),
            'America/Argentina/Buenos_Aires',
            'yyyy-MM-dd HH:mm:ss'
        );

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
            mermaPct, // %
            rendimientoPct, // %
            pesoUnidad,
            data.observaciones || ''
        ]);

        // Aplicar estilo a la nueva fila (Banding manual o dejar que formato condicional lo haga)
        // Para performance, es mejor aplicar formato por lote o tener pre-formato.
        // Aquí aplicaremos bordes simples a la fila insertada.
        const lastRow = sheet.getLastRow();
        const lastCol = sheet.getLastColumn();
        const range = sheet.getRange(lastRow, 1, 1, lastCol);
        range.setBorder(true, true, true, true, true, true, '#dcdde1', SpreadsheetApp.BorderStyle.SOLID);
        range.setVerticalAlignment('middle');

        return jsonResponse({
            success: true,
            message: 'Registro guardado',
        });

    } catch (error) {
        return jsonResponse({ success: false, error: error.toString() });
    }
}

function doGet(e) {
    try {
        const sheet = getOrCreateSheet();
        if (sheet.getLastRow() <= 1) return jsonResponse({ success: true, data: [] });

        const data = sheet.getDataRange().getValues();
        const headers = data[0];
        const rows = data.slice(1).map(row => {
            const obj = {};
            headers.forEach((h, i) => obj[h] = row[i]);
            return obj;
        });

        return jsonResponse({ success: true, data: rows });
    } catch (error) {
        return jsonResponse({ success: false, error: error.toString() });
    }
}

function getOrCreateSheet() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
        sheet = ss.insertSheet(SHEET_NAME);
    }
    return sheet;
}

/**
 * EJECUTAR ESTA FUNCIÓN MANUALMENTE UNA VEZ PARA DAR FORMATO PROFESIONAL
 */
function setupProfessionalSheet() {
    const sheet = getOrCreateSheet();
    const headers = [
        '📍 Local', '🕒 Timestamp', '👤 Responsable', '📂 Categoría', '🥩 Insumo',
        '⚖️ Peso Inicial (Kg)', '📦 Producto', '🔢 Cantidad', '✅ Peso Final (Kg)',
        '📉 Merma (Kg)', '📉 Merma (%)', '📈 Rendimiento (%)', '⚖️ Peso/Unidad (Kg)', '📝 Observaciones'
    ];

    // 1. Limpiar y Headers
    if (sheet.getLastRow() === 0) {
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    } else {
        // Update headers if exist
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }

    const lastCol = headers.length;
    const headerRange = sheet.getRange(1, 1, 1, lastCol);

    // 2. Estilo de Header (Corporativo Dark)
    headerRange
        .setBackground('#1e1e2d') // Dark Blue/Grey
        .setFontColor('#ffffff')
        .setFontWeight('bold')
        .setFontFamily('Outfit') // Fallback to sans-serif if not valid
        .setHorizontalAlignment('center')
        .setVerticalAlignment('middle')
        .setWrap(true);

    sheet.setFrozenRows(1);
    sheet.setRowHeight(1, 40);

    // 3. Formato de Columnas (Anchos estimados)
    sheet.setColumnWidth(1, 120); // Local
    sheet.setColumnWidth(2, 140); // Time
    sheet.setColumnWidth(4, 120); // Cat
    sheet.setColumnWidth(14, 200); // Obs

    // 4. Formato Condicional (Banding)
    // Nota: GAS no tiene método directo simple para "Alternating Colors" como UI, 
    // pero podemos aplicar banding range.
    const dataRange = sheet.getRange(2, 1, 999, lastCol);
    dataRange.applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY);

    // 5. Formato de Número para columnas específicas
    // F, G, J, M son columnas de Peso (0.000) -> indices 6, 9, 10, 13 (1-based)
    // Indices: 6 (Peso Ini), 9 (Peso Fin), 10 (Merma Kg), 13 (Peso Uni)
    const numberFormats = [
        { col: 6, fmt: '0.000 "kg"' },
        { col: 9, fmt: '0.000 "kg"' },
        { col: 10, fmt: '0.000 "kg"' },
        { col: 13, fmt: '0.000 "kPa"' } // Error typo fix -> kg
    ];

    sheet.getRange("F2:F").setNumberFormat('0.000 "kg"');
    sheet.getRange("I2:I").setNumberFormat('0.000 "kg"');
    sheet.getRange("J2:J").setNumberFormat('0.000 "kg"');
    sheet.getRange("M2:M").setNumberFormat('0.000 "kg"');

    // Porcentajes
    sheet.getRange("K2:K").setNumberFormat('0.00"%"');  // Merma %
    sheet.getRange("L2:L").setNumberFormat('0.00"%"');  // Rendimiento %

    // Reglas de color condicional para Merma % (K)
    // Rojo si > 15, Verde si < 10
    const ruleHigh = SpreadsheetApp.newConditionalFormatRule()
        .whenNumberGreaterThan(15)
        .setBackground('#ff7675')
        .setFontColor('white')
        .setRanges([sheet.getRange("K2:K")])
        .build();

    const ruleLow = SpreadsheetApp.newConditionalFormatRule()
        .whenNumberLessThan(10)
        .setBackground('#00b894')
        .setFontColor('white')
        .setRanges([sheet.getRange("K2:K")])
        .build();

    const rules = sheet.getConditionalFormatRules();
    rules.push(ruleHigh);
    rules.push(ruleLow);
    sheet.setConditionalFormatRules(rules);

    Logger.log('Hoja configurada profesionalmente');
}

// Alias para compatibilidad anterior, llama a la nueva
function setupSheet() {
    setupProfessionalSheet();
}

function jsonResponse(data) {
    return ContentService
        .createTextOutput(JSON.stringify(data))
        .setMimeType(ContentService.MimeType.JSON);
}
