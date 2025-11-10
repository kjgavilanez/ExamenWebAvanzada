import { Arboles } from "../models/arboles.js";

//  funciones de cálculo integradas
const PRECIOS = {
    paltos: 1200,
    limones: 1000,
    chirimoyos: 980,
};

const DESCUENTOS = {
    paltos: { low: 0.10, high: 0.18 },
    limones: { low: 0.125, high: 0.20 },
    chirimoyos: { low: 0.145, high: 0.19 },
};

function validarTipo(tipo) {
    if (!tipo || typeof tipo !== 'string') return null;
    const key = tipo.trim().toLowerCase();
    return PRECIOS.hasOwnProperty(key) ? key : null;
}

function validarCantidad(cantidad) {
    if (typeof cantidad !== 'number') return false;
    if (!Number.isFinite(cantidad)) return false;
    if (!Number.isInteger(cantidad)) return false;
    return cantidad > 0;
}

export function calcularValorPagar(tipo, cantidad, ivaRate = 0.19) {
    const key = validarTipo(tipo);
    if (!key) throw new Error(`Tipo inválido: ${tipo}`);
    if (!validarCantidad(cantidad)) throw new Error(`Cantidad inválida: ${cantidad}`);

    const precioUnitario = PRECIOS[key];
    const base = precioUnitario * cantidad;

    let perTypeDiscount = 0;
    if (cantidad > 300) perTypeDiscount = DESCUENTOS[key].high;
    else if (cantidad > 100) perTypeDiscount = DESCUENTOS[key].low;

    let extra15 = 0;
    if (cantidad > 1000) extra15 = 0.15;

    const afterPerType = base * (1 - perTypeDiscount);
    const afterAll = afterPerType * (1 - extra15);

    const iva = +(afterAll * ivaRate).toFixed(2);
    const valorPagar = +(afterAll + iva).toFixed(2);

    const effectiveRebaja = +(1 - afterAll / base).toFixed(4);

    return {
        precioUnitario,
        cantidad,
        rebaja: + (effectiveRebaja * 100).toFixed(2),
        subtotalSinIva: +afterAll.toFixed(2),
        iva,
        valorPagar
    };
}

export function calcularCompra(items, ivaRate = 0.19) {
    if (!Array.isArray(items) || items.length === 0) {
        throw new Error('items debe ser un arreglo no vacío con objetos { tipo, cantidad }');
    }

    const detalles = [];
    let totalBase = 0;
    let totalAfterPerType = 0;
    let totalCantidad = 0;

    for (const it of items) {
        const key = validarTipo(it.tipo);
        const cantidad = it.cantidad;
        if (!key) throw new Error(`Tipo inválido en items: ${it.tipo}`);
        if (!validarCantidad(cantidad)) throw new Error(`Cantidad inválida en items: ${cantidad}`);

        const precioUnitario = PRECIOS[key];
        const base = precioUnitario * cantidad;

        let perTypeDiscount = 0;
        if (cantidad > 300) perTypeDiscount = DESCUENTOS[key].high;
        else if (cantidad > 100) perTypeDiscount = DESCUENTOS[key].low;

        const afterPerType = base * (1 - perTypeDiscount);

        detalles.push({
            tipo: key,
            precioUnitario,
            cantidad,
            base: +base.toFixed(2),
            descuentoPercent: +(perTypeDiscount * 100).toFixed(2),
            subtotalAfterDescuento: +afterPerType.toFixed(2)
        });

        totalBase += base;
        totalAfterPerType += afterPerType;
        totalCantidad += cantidad;
    }

    let extra15 = false;
    let afterAll = totalAfterPerType;
    if (totalCantidad > 1000) {
        afterAll = afterAll * (1 - 0.15);
        extra15 = true;
    }

    const iva = +(afterAll * ivaRate).toFixed(2);
    const valorPagar = +(afterAll + iva).toFixed(2);

    const totalDiscountPercent = +(1 - afterAll / totalBase).toFixed(4);

    return {
        detalles,
        totalBase: +totalBase.toFixed(2),
        totalCantidad,
        totalAfterPerType: +totalAfterPerType.toFixed(2),
        extra15,
        subtotalSinIva: +afterAll.toFixed(2),
        rebajaPercent: + (totalDiscountPercent * 100).toFixed(2),
        iva,
        valorPagar
    };
}

// crear un nuevo registro de árboles
export const crearArboles = async (req, res) => {
    try {
        if (Array.isArray(req.body.items)) {
            const resultado = calcularCompra(req.body.items);
            return res.status(200).json(resultado);
        }
        // validación básica
        const { tipo, cantidad } = req.body;
        if (!tipo || typeof tipo !== 'string' || typeof cantidad !== 'number') {
            return res.status(400).json({ message: 'tipo (string) y cantidad (number) son requeridos' });
        }
        // cálculo 
        const { precioUnitario, rebaja, subtotalSinIva, iva, valorPagar } = calcularValorPagar(tipo, cantidad);
        const nuevoArbol = new Arboles({ tipo, cantidad, precioUnitario, rebaja, valorPagar });
        await nuevoArbol.save();
        res.status(201).json({ nuevoArbol, detalles: { precioUnitario, rebaja, subtotalSinIva, iva, valorPagar } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// obtener todos los registros de árboles
export const obtenerArboles = async (req, res) => {
    try {
        const arboles = await Arboles.find();
        res.status(200).json(arboles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// obtener un registro de árboles por ID
export const obtenerArbolPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const arbol = await Arboles.findById(id);
        if (!arbol) {
            return res.status(404).json({ message: "Árbol no encontrado" });
        }
        res.status(200).json(arbol);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// actualizar un registro de árboles por ID
export const actualizarArbol = async (req, res) => {
    try {
        const { id } = req.params;
        const { tipo, cantidad } = req.body;
        if (!tipo || typeof tipo !== 'string' || typeof cantidad !== 'number') {
            return res.status(400).json({ message: 'tipo (string) y cantidad (number) son requeridos' });
        }
        const { precioUnitario, rebaja, valorPagar } = calcularValorPagar(tipo, cantidad);
        const arbolActualizado = await Arboles.findByIdAndUpdate(
            id,
            { tipo, cantidad, precioUnitario, rebaja, valorPagar },
            { new: true }
        );
        if (!arbolActualizado) {
            return res.status(404).json({ message: "Árbol no encontrado" });
        }   
        res.status(200).json(arbolActualizado);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// eliminar un registro de árboles por ID
export const eliminarArbol = async (req, res) => {
    try {
        const { id } = req.params;
        const arbolEliminado = await Arboles.findByIdAndDelete(id);
        if (!arbolEliminado) {
            return res.status(404).json({ message: "Árbol no encontrado" });
        }   
        res.status(200).json({ message: "Árbol eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }   
};
