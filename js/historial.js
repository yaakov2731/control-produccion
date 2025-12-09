document.addEventListener('DOMContentLoaded', initHistorial);

function initHistorial() {
    loadData();
    setupFilters();
}

function loadData() {
    const tbody = document.getElementById('historialBody');
    const loader = document.getElementById('loader');

    loader.classList.add('show');

    // Usar Google Visualization API Query para obtener CSV/JSON sin problemas de CORS en GET
    // O usar el doGet si está configurado. El usuario dio un doGet que retorna JSON. 
    // Probaremos primero con el doGet que es más limpio si funciona el CORS.
    // Si falla, fallback a visualización simple.

    // Nota: Para doGet desde navegador, a veces se necesita redirect follow.
    fetch(CONFIG.SCRIPT_URL)
        .then(response => response.json())
        .then(response => {
            if (response.success) {
                renderTable(response.data);
            } else {
                showToast('Error obteniendo datos: ' + response.error, 'error');
            }
        })
        .catch(err => {
            console.warn('Falló fetch directo, intentando modo JSONP/CSV parser local o mock', err);
            // Fallback a datos mock si no hay backend configurado aún
            // O mostrar mensaje de error amigable.
            showToast('No se pudo conectar con la hoja. Verifica la URL de script.', 'warning');
            renderTable([]); // Render empty or mock
        })
        .finally(() => {
            loader.classList.remove('show');
        });
}

function renderTable(data) {
    const tbody = document.getElementById('historialBody');
    tbody.innerHTML = '';

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center">No hay registros</td></tr>';
        return;
    }

    // Ordenar por fecha descendente (asumiendo Timestamp en col 1)
    // data viene como array de objetos si usamos el doGe del usuario
    // Ajustar según estructura real

    data.reverse().forEach((row, index) => {
        const tr = document.createElement('tr');
        tr.style.animationDelay = `${index * 0.05}s`;

        // Mapeo seguro de campos (el script del usuario devuelve claves PascalCase o como estén en header)
        // El script del usuario hace: obj[h] = row[i], headers son: 'Local', 'Timestamp', etc.

        tr.innerHTML = `
      <td data-label="Fecha">${formatDate(row['Timestamp'])}</td>
      <td data-label="Local">${row['Local']}</td>
      <td data-label="Responsable">${row['Responsable']}</td>
      <td data-label="Insumo">${row['Insumo']}</td>
      <td data-label="Producto">${row['Producto']}</td>
      <td data-label="Merma %">
        <span class="badge ${getMermaBadgeClass(row['Merma (%)'])}">
          ${row['Merma (%)']}%
        </span>
      </td>
      <td data-label="Rendimiento">${row['Rendimiento (%)']}%</td>
      <td data-label="Acciones">
        <button class="btn-icon" title="Ver detalles">👁️</button>
      </td>
    `;
        tbody.appendChild(tr);
    });
}

function formatDate(dateString) {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function getMermaBadgeClass(valor) {
    const v = parseFloat(valor);
    if (v < 10) return 'success';
    if (v < 15) return 'warning';
    return 'danger';
}

function setupFilters() {
    document.getElementById('btnFiltrar').addEventListener('click', () => {
        const local = document.getElementById('filtroLocal').value;
        const rows = document.querySelectorAll('#historialBody tr');

        rows.forEach(row => {
            const cellLocal = row.children[1].textContent; // Indice 1 es Local
            if (!local || cellLocal === local) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });

    document.getElementById('btnExportar').addEventListener('click', () => {
        window.open(CONFIG.SHEET_CSV_URL, '_blank');
    });
}
