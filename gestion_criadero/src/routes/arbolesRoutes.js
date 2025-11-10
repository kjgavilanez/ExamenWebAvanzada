import {Router} from "express" ;
import {
    crearArboles,
    obtenerArboles,
    obtenerArbolPorId,
    actualizarArbol,
    eliminarArbol
    
} from "../controllers/arbolesController.js";

const router = Router();

// Ruta para crear un nuevo registro de árboles
router.post("/", crearArboles);
router.get("/", obtenerArboles);
router.get("/:id", obtenerArbolPorId);
router.put("/:id", actualizarArbol);
router.delete("/:id", eliminarArbol);

export default router;
