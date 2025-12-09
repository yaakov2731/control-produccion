const CONFIG = {
    // IMPORTANT: This ID needs to be updated with the actual Script ID after deployment
    SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbwq06Zk1pfyHi2rxbmhipUyrTc03By6xoodJ-39UmERdL7kcE3bWwhBBwxC8ihDETaK/exec',
    // Spreadsheets URLs for data reading
    SHEET_URL: 'https://docs.google.com/spreadsheets/d/placeholder_SHEET_ID_here/edit',
    SHEET_CSV_URL: 'https://docs.google.com/spreadsheets/d/placeholder_SHEET_ID_here/gviz/tq?tqx=out:csv&sheet=Datos_Crudos',

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
