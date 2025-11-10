
import mongoose from "mongoose";

const arbolesSchema = new mongoose.Schema(
    {
        tipo: { type: String, required: true },
        cantidad: { type: Number, required: true },
        precioUnitario: { type: Number, required: true },
        rebaja: { type: Number, required: true },
        valorPagar: { type: Number, required: true }
    }, { timestamps: true }
);

export const Arboles = mongoose.model("Arboles", arbolesSchema);