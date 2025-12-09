document.addEventListener('DOMContentLoaded', init);

function init() {
    renderSelectOptions();
    setupEventListeners();
    animateEntrance();
}

function renderSelectOptions() {
    const localSelect = document.getElementById('local');
    const categoriaSelect = document.getElementById('categoria');

    CONFIG.LOCALES.forEach(local => {
        const option = document.createElement('option');
        option.value = local.id;
        option.textContent = `${local.emoji} ${local.nombre}`;
        localSelect.appendChild(option);
    });

    CONFIG.CATEGORIAS.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = `${cat.emoji} ${cat.nombre}`;
        categoriaSelect.appendChild(option);
    });
}

function setupEventListeners() {
    const form = document.getElementById('produccionForm');
    const inputs = form.querySelectorAll('input, select, textarea');

    // Auto-calculation events
    ['pesoInicial', 'pesoFinal', 'cantidad'].forEach(id => {
        document.getElementById(id).addEventListener('input', calculateMetrics);
    });

    // Form submission
    form.addEventListener('submit', handleFormSubmit);

    // Clear button
    document.getElementById('btnLimpiar').addEventListener('click', () => {
        form.reset();
        resetMetrics();
        showToast('Formulario limpiado', 'warning');
    });

    // Input animations on focus
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('focused');
        });
        input.addEventListener('blur', () => {
            input.parentElement.classList.remove('focused');
        });
    });
}

function calculateMetrics() {
    const pesoInicial = parseFloat(document.getElementById('pesoInicial').value) || 0;
    const pesoFinal = parseFloat(document.getElementById('pesoFinal').value) || 0;
    const cantidad = parseFloat(document.getElementById('cantidad').value) || 1;

    if (pesoInicial > 0) {
        const mermaKg = pesoInicial - pesoFinal;
        const mermaPct = (mermaKg / pesoInicial) * 100;
        const rendimientoPct = (pesoFinal / pesoInicial) * 100;
        const pesoUnidad = pesoFinal / cantidad;

        updateMetricCard('mermaKg', mermaKg.toFixed(3) + ' kg');

        // Configurar color de Merma %
        const mermaPctCard = document.getElementById('card-mermaPct');
        mermaPctCard.className = 'metric-card'; // reset
        if (mermaPct < 10) mermaPctCard.classList.add('good');
        else if (mermaPct < 15) mermaPctCard.classList.add('warning');
        else mermaPctCard.classList.add('bad');

        updateMetricCard('mermaPct', mermaPct.toFixed(2) + ' %');
        updateMetricCard('rendimientoPct', rendimientoPct.toFixed(2) + ' %');
        updateMetricCard('pesoUnidad', pesoUnidad.toFixed(3) + ' kg');
    } else {
        resetMetrics();
    }
}

function updateMetricCard(id, value) {
    const element = document.getElementById(id);
    // Simple animations for value update
    element.style.opacity = 0;
    setTimeout(() => {
        element.textContent = value;
        element.style.opacity = 1;
    }, 100);
}

function resetMetrics() {
    ['mermaKg', 'mermaPct', 'rendimientoPct', 'pesoUnidad'].forEach(id => {
        document.getElementById(id).textContent = '-';
    });
    const mermaPctCard = document.getElementById('card-mermaPct');
    mermaPctCard.className = 'metric-card';
}

function handleFormSubmit(e) {
    e.preventDefault();

    const submitBtn = document.getElementById('btnGuardar');
    const loader = document.getElementById('loader');

    // Validación básica visual
    if (!e.target.checkValidity()) {
        e.target.classList.add('animate-shake');
        setTimeout(() => e.target.classList.remove('animate-shake'), 500);
        showToast('Por favor complete todos los campos requeridos', 'error');
        return;
    }

    // UI Processing State
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Guardando...';
    loader.classList.add('show');

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    // Agregar timestamp local si es necesario, o dejar que el backend lo maneje

    // Simulación de envío a Google Apps Script
    // Como no podemos hacer POST directo a GAS desde cliente sin CORS/Redirect issues a veces,
    // usaremos fetch con mode 'no-cors' para enviarlo, o 'cors' si el script está configurado correctamente.
    // El usuario proporcionó un script con doPost que devuelve JSON. 
    // Para que funcione el retorno de JSON, el script debe ser deployed como Web App con acceso "Anonymous".

    fetch(CONFIG.SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', // 'no-cors' es lo más seguro para evitar bloqueos, pero no leemos respuesta
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(() => {
            // Con no-cors asumimos éxito si no hay error de red
            handleSuccess(e.target);
        })
        .catch(error => {
            console.error('Error:', error);
            showToast('Error de conexión al guardar', 'error');
        })
        .finally(() => {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '💾 Guardar Registro';
            loader.classList.remove('show');
        });
}

function handleSuccess(form) {
    showToast('¡Registro guardado exitosamente!', 'success');
    form.reset();
    resetMetrics();

    // Animación de éxito en todo el formulario
    form.classList.add('animate-success');
    setTimeout(() => form.classList.remove('animate-success'), 1000);
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    // Trigger reflow
    void toast.offsetWidth;

    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, CONFIG.ANIMACIONES.duracionToast);
}

function animateEntrance() {
    const elements = document.querySelectorAll('.stagger-animate');
    elements.forEach((el, index) => {
        el.style.animationDelay = `${index * 0.1}s`;
        el.classList.add('animate-fadeInUp');
    });
}
