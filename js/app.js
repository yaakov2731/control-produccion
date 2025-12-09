document.addEventListener('DOMContentLoaded', init);

function init() {
    renderLocalButtons();
    renderCategories();
    setupEventListeners();
}

function renderLocalButtons() {
    const container = document.getElementById('localGrid');
    const input = document.getElementById('local');

    CONFIG.LOCALES.forEach(local => {
        const btn = document.createElement('div');
        btn.className = 'local-btn';
        btn.innerHTML = `
      <div class="local-emoji">${local.emoji}</div>
      <div class="local-name">${local.nombre}</div>
    `;

        btn.addEventListener('click', () => {
            // Remove selected from all
            document.querySelectorAll('.local-btn').forEach(b => b.classList.remove('selected'));
            // Add to this
            btn.classList.add('selected');
            // Set value
            input.value = local.id; // or local.nombre if preferred, usually ID

            // Visual feedback
            // btn.style.transform = "scale(0.95)";
            // setTimeout(() => btn.style.transform = "", 100);
        });

        container.appendChild(btn);
    });
}

function renderCategories() {
    const select = document.getElementById('categoria');
    CONFIG.CATEGORIAS.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id; // or name
        option.textContent = `${cat.emoji} ${cat.nombre}`;
        select.appendChild(option);
    });
}

function setupEventListeners() {
    const form = document.getElementById('produccionForm');

    // Auto-calculation
    ['pesoInicial', 'pesoFinal', 'cantidad'].forEach(id => {
        document.getElementById(id).addEventListener('input', calculateMetrics);
    });

    // Submit
    form.addEventListener('submit', handleFormSubmit);
}

function calculateMetrics() {
    const pesoInicial = parseFloat(document.getElementById('pesoInicial').value) || 0;
    const pesoFinal = parseFloat(document.getElementById('pesoFinal').value) || 0;

    if (pesoInicial > 0) {
        const mermaKg = pesoInicial - pesoFinal;
        const mermaPct = (mermaKg / pesoInicial) * 100;
        const rendimientoPct = (pesoFinal / pesoInicial) * 100;

        const mermaEl = document.getElementById('mermaPct');
        mermaEl.textContent = mermaPct.toFixed(1) + '%';
        mermaEl.style.color = mermaPct < 15 ? '#00b894' : '#d63031'; // Green or Red

        const rendEl = document.getElementById('rendimientoPct');
        rendEl.textContent = rendimientoPct.toFixed(1) + '%';
    }
}

function handleFormSubmit(e) {
    e.preventDefault();

    if (!document.getElementById('local').value) {
        showToast('Por favor selecciona un local', 'error');
        return;
    }

    const btn = document.getElementById('btnGuardar');
    const loader = document.getElementById('loader');

    // UI Loading
    btn.disabled = true;
    loader.classList.add('show');

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    // Get local NAME instead of ID for spreadsheet readability if desired, 
    // currently sending ID. Let's fix to send Name if config matches.
    const localObj = CONFIG.LOCALES.find(l => l.id === data.local);
    if (localObj) data.local = localObj.nombre;

    console.log("Sending data to:", CONFIG.SCRIPT_URL, data);

    fetch(CONFIG.SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
        .then(() => {
            handleSuccess(e.target);
        })
        .catch(error => {
            console.error('Error:', error);
            showToast('Error de conexión', 'error');
        })
        .finally(() => {
            btn.disabled = false;
            loader.classList.remove('show');
        });
}

function handleSuccess(form) {
    showToast('¡Guardado correctamente! 🎉', 'success');
    form.reset();
    // Clear local selection visual
    document.querySelectorAll('.local-btn').forEach(b => b.classList.remove('selected'));
    document.getElementById('local').value = "";
    document.getElementById('mermaPct').textContent = "-";
    document.getElementById('rendimientoPct').textContent = "-";
}

function showToast(msg, type) {
    const container = document.getElementById('toastContainer');
    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    t.textContent = msg;
    container.appendChild(t);
    setTimeout(() => t.remove(), 3000);
}
