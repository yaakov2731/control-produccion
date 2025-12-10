const CONFIG = {
    // ⚠️ IMPORTANTE: REEMPLAZA ESTA URL CON LA QUE OBTENGAS AL DESPLEGAR EN APPS SCRIPT
    // Debe terminar en '/exec'
    SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbw9fVKtHo-RNzyuuZ3bCaag4XnRsYXBO1nT_Ckm7dpVSkaWF6RIVTw62hc_mKvo5j57/exec',

    // Opcional: Para referencia rápida
    SHEET_URL: 'TU_URL_DEL_GOOGLE_SHEET_AQUI',

    LOCALES: [
        { id: 'umo_grill', nombre: 'Umo Grill', emoji: '🔥', color: '#e94560' },
        { id: 'brooklyn', nombre: 'Brooklyn', emoji: '🍔', color: '#ffc107' },
        { id: 'trento', nombre: 'Trento', emoji: '☕', color: '#8d6e63' },
        { id: 'puerto_gelato', nombre: 'Puerto Gelato', emoji: '🍦', color: '#64b5f6' },
        { id: 'rustica', nombre: 'Rustica', emoji: '🍕', color: '#ff7043' }
    ],

    CATEGORIAS: [
        { id: 'carnes', nombre: 'Carnes', emoji: '🥩' },
        { id: 'verduras', nombre: 'Verduras', emoji: '🥬' },
        { id: 'lacteos', nombre: 'Lácteos', emoji: '🧀' },
        { id: 'almacen', nombre: 'Almacén', emoji: '📦' },
        { id: 'panaderia', nombre: 'Panadería', emoji: '🥐' }
    ],

    ANIMACIONES: {
        duracionToast: 3000,
        delayStagger: 100
    }
};
