import mongoose from "mongoose";
import "dotenv/config";

export async function conectarDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Conexión a la base de datos MongoDB exitosa");
    } catch (error) {
        console.error("Error al conectar a la base de datos MongoDB:", error);
    }
};