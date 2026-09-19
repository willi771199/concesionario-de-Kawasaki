let carrito = [];

let subtotalFactura = 0;
let ivaFactura = 0;
let totalFactura = 0;


const bodyFactura = document.getElementById("factura-body");

const subtotalElement = document.getElementById("subtotal");
const ivaElement = document.getElementById("iva");
const totalElement = document.getElementById("total");

const fechaFactura = document.getElementById("fecha-factura");
const btnPDF = document.getElementById("btn-pdf");



window.addEventListener("DOMContentLoaded", () => {

    const hoy = new Date()
        .toISOString()
        .split("T")[0];

    fechaFactura.value = hoy;

    cargarCarrito();

});



function cargarCarrito(){

    carrito =
        JSON.parse(
            localStorage.getItem("carrito")
        ) || [];


    if(carrito.length === 0){

        bodyFactura.innerHTML = `
            <tr>
                <td colspan="4">
                    No existen productos para facturar
                </td>
            </tr>
        `;

        calcularTotales(0);

        return;
    }


    renderFactura();

}




function renderFactura(){

    bodyFactura.innerHTML = "";

    let subtotal = 0;


    carrito.forEach(producto => {


        const totalProducto =
            producto.price * producto.quantity;


        subtotal += totalProducto;


        bodyFactura.innerHTML += `

        <tr>

            <td>
                ${producto.name}
            </td>

            <td>
                ${producto.quantity}
            </td>

            <td>
                ${formatearMoneda(producto.price)}
            </td>

            <td>
                ${formatearMoneda(totalProducto)}
            </td>

        </tr>

        `;

    });



    calcularTotales(subtotal);

}




function calcularTotales(subtotal){


    subtotalFactura = subtotal;


    ivaFactura =
        subtotal * 0.19;


    totalFactura =
        subtotal + ivaFactura;



    subtotalElement.textContent =
        formatearMoneda(subtotalFactura);


    ivaElement.textContent =
        formatearMoneda(ivaFactura);


    totalElement.textContent =
        formatearMoneda(totalFactura);


}





function guardarFacturaHistorico(){


    let ventas =
        JSON.parse(
            localStorage.getItem("ventas")
        ) || [];



    const numeroFactura =
        document.getElementById(
            "numero-factura"
        ).value || "FAC-001";



    const existe =
        ventas.some(
            venta =>
            venta.numero === numeroFactura
        );



    if(existe){

        return;

    }



    const factura = {

        numero: numeroFactura,

        fecha:
            fechaFactura.value,

        cliente:
            document.getElementById(
                "cliente"
            ).value || "Consumidor final",


        documento:
            document.getElementById(
                "documento"
            ).value || "",


        correo:
            document.getElementById(
                "correo"
            ).value || "",


        productos:
            carrito,


        subtotal:
            subtotalFactura,


        iva:
            ivaFactura,


        total:
            totalFactura

    };



    ventas.push(factura);



    localStorage.setItem(
        "ventas",
        JSON.stringify(ventas)
    );

}





function limpiarCarrito(){


    localStorage.removeItem(
        "carrito"
    );


}





function formatearMoneda(valor){

    return new Intl.NumberFormat(
        "es-CO",
        {
            style:"currency",
            currency:"COP"
        }
    ).format(valor);

}





btnPDF.addEventListener(
"click",
()=>{


    if(carrito.length === 0){

        alert(
            "No existen productos para facturar"
        );

        return;

    }



    guardarFacturaHistorico();



    const documento =
        document.getElementById(
            "documento-factura"
        );



    const numero =
        document.getElementById(
            "numero-factura"
        ).value || "Factura";



    const opciones = {


        margin:[10,10,10,10],

        filename:
            `${numero}.pdf`,


        image:{
            type:"jpeg",
            quality:0.98
        },


        html2canvas:{
            scale:2
        },


        jsPDF:{
            unit:"mm",
            format:"a4",
            orientation:"portrait"
        }

    };



    document.body.classList.add(
        "generating-pdf"
    );



    html2pdf()

        .set(opciones)

        .from(documento)

        .save()

        .then(()=>{


            limpiarCarrito();


            document.body.classList.remove(
                "generating-pdf"
            );


        });


});
