import express from 'express';
import cors from 'cors';
import "dotenv/config";
import { conectarDB } from './config/mongo.js';
import arbolesRoutes from './routes/arbolesRoutes.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/arboles", arbolesRoutes);

await conectarDB();
app.listen(process.env.PORT, () => {
    console.log(`Servidor corriendo en el puerto ${process.env.PORT}`);
});