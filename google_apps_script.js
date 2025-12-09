/**
 * CODIGO DE GOOGLE APPS SCRIPT
 * Copia y pega este contenido en tu editor de script de Google Sheet.
 * Asegúrate de publicar como aplicación web con acceso "Cualquiera" (incluyendo anónimos).
 */

const SHEET_NAME = 'Datos_Crudos';

function doPost(e) {
    // Manejo de CORS simplificado para requests directos si es necesario
    // En modo no-cors desde client, esto se ejecuta pero el cliente no ve la respuesta.

    try {
        const data = JSON.parse(e.postData.contents);
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME)
            || SpreadsheetApp.getActiveSpreadsheet().insertSheet(SHEET_NAME);

        // Auto-setup si es la primera vez
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

        return jsonResponse({
            success: true,
            message: 'Registro guardado',
            data: { mermaKg, mermaPct, rendimientoPct, pesoUnidad, timestamp }
        });

    } catch (error) {
        return jsonResponse({ success: false, error: error.toString() });
    }
}

function doGet(e) {
    try {
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
        if (!sheet) return jsonResponse({ success: true, data: [] });

        const data = sheet.getDataRange().getValues();
        if (data.length < 2) return jsonResponse({ success: true, data: [] });

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

function setupSheet() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME)
        || SpreadsheetApp.getActiveSpreadsheet().insertSheet(SHEET_NAME);

    const headers = [
        'Local', 'Timestamp', 'Responsable', 'Categoría', 'Insumo',
        'Peso Inicial (Kg)', 'Producto', 'Cantidad', 'Peso Final (Kg)',
        'Merma (Kg)', 'Merma (%)', 'Rendimiento (%)', 'Peso/Unidad (Kg)', 'Observaciones'
    ];

    // Limpiar y setear headers si está vacía
    if (sheet.getLastRow() === 0) {
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
        sheet.getRange(1, 1, 1, headers.length)
            .setBackground('#1a1a2e')
            .setFontColor('#ffffff')
            .setFontWeight('bold');
        sheet.setFrozenRows(1);
    }
}

function jsonResponse(data) {
    return ContentService
        .createTextOutput(JSON.stringify(data))
        .setMimeType(ContentService.MimeType.JSON);
}
