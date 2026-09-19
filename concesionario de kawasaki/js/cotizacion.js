// Arreglo para almacenar los elementos de la cotización
let items = [];

// Elementos del DOM
const formItem = document.getElementById('form-item');
const inputDescripcion = document.getElementById('descripcion');
const inputCantidad = document.getElementById('cantidad');
const inputPrecio = document.getElementById('precio');

const tablaBody = document.getElementById('tabla-body');
const subtotalVal = document.getElementById('subtotal-val');
const ivaVal = document.getElementById('iva-val');
const totalVal = document.getElementById('total-val');

const btnLimpiar = document.getElementById('btn-limpiar');
const btnPDF = document.getElementById('btn-pdf');
const inputFecha = document.getElementById('fecha-cotizacion');

// Establecer fecha actual por defecto
window.addEventListener('DOMContentLoaded', () => {
    const hoy = new Date().toISOString().split('T')[0];
    inputFecha.value = hoy;
});

// Evento: Agregar Elemento
formItem.addEventListener('submit', (e) => {
    e.preventDefault();

    const descripcion = inputDescripcion.value.trim();
    const cantidad = parseFloat(inputCantidad.value);
    const precio = parseFloat(inputPrecio.value);

    if (descripcion === '' || isNaN(cantidad) || isNaN(precio)) {
        alert('Por favor complete todos los campos correctamente.');
        return;
    }

    const nuevoItem = {
        id: Date.now(),
        descripcion: descripcion,
        cantidad: cantidad,
        precio: precio,
        subtotal: cantidad * precio
    };

    items.push(nuevoItem);
    actualizarInterfaz();

    // Limpiar formulario
    formItem.reset();
    inputCantidad.value = 1;
    inputDescripcion.focus();
});

// Función: Eliminar Elemento
function eliminarItem(id) {
    items = items.filter(item => item.id !== id);
    actualizarInterfaz();
}

// Función: Formatear Moneda
function formatearMoneda(valor) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 2
    }).format(valor);
}

// Función: Renderizar Tabla y Recalcular Totales
function actualizarInterfaz() {
    // Limpiar tabla
    tablaBody.innerHTML = '';

    if (items.length === 0) {
        tablaBody.innerHTML = `
            <tr id="fila-vacia">
                <td colspan="5" class="texto-vacio">No hay elementos agregados aún.</td>
            </tr>
        `;
        subtotalVal.textContent = formatearMoneda(0);
        ivaVal.textContent = formatearMoneda(0);
        totalVal.textContent = formatearMoneda(0);
        return;
    }

    let acumuladoSubtotal = 0;

    // Renderizar filas
    items.forEach((item) => {
        acumuladoSubtotal += item.subtotal;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${escapeHTML(item.descripcion)}</td>
            <td class="col-cant">${item.cantidad}</td>
            <td class="col-precio">${formatearMoneda(item.precio)}</td>
            <td class="col-total">${formatearMoneda(item.subtotal)}</td>
            <td class="col-accion no-print">
                <button class="btn-eliminar" onclick="eliminarItem(${item.id})">Eliminar</button>
            </td>
        `;
        tablaBody.appendChild(tr);
    });

    // Calcular Totales (IVA 19%)
    const tasaIVA = 0.19;
    const ivaCalculado = acumuladoSubtotal * tasaIVA;
    const totalFinal = acumuladoSubtotal + ivaCalculado;

    subtotalVal.textContent = formatearMoneda(acumuladoSubtotal);
    ivaVal.textContent = formatearMoneda(ivaCalculado);
    totalVal.textContent = formatearMoneda(totalFinal);
}

// Función auxiliar para evitar ataques XSS
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

// Evento: Limpiar Todo
btnLimpiar.addEventListener('click', () => {
    if (items.length === 0) return;

    if (confirm('¿Está seguro de que desea borrar todos los elementos de la cotización?')) {
        items = [];
        actualizarInterfaz();
    }
});

// Evento: Generar y Descargar PDF
btnPDF.addEventListener('click', () => {
    if (items.length === 0) {
        alert('Debe agregar al menos un elemento a la cotización antes de generar el PDF.');
        return;
    }

    const elemento = document.getElementById('documento-cotizacion');
    const numCotizacion = document.getElementById('num-cotizacion').value || 'Cotizacion';

    // Opciones de configuración para html2pdf
    const opciones = {
        margin:       [10, 10, 10, 10], // márgenes en mm [arriba, izquierda, abajo, derecha]
        filename:     `${numCotizacion}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, logging: false },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Añadir clase temporal para ocultar botones/controles no deseados en el PDF
    document.body.classList.add('generating-pdf');

    html2pdf()
        .set(opciones)
        .from(elemento)
        .save()
        .then(() => {
            // Remover la clase al finalizar la descarga
            document.body.classList.remove('generating-pdf');
        })
        .catch((err) => {
            console.error('Error al generar PDF:', err);
            document.body.classList.remove('generating-pdf');
        });
});