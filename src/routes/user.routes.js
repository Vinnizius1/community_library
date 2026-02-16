import { Router } from "express";
import userController from "../controllers/user.controllers.js";

const router = Router();

// 1ª Rota
// Não preciso passar 'req' e 'res' aqui, pois o router do Express já os fornece automaticamente quando a rota é acessada.
// O método 'createUserController' é responsável por lidar com a lógica de criação de um novo usuário,
// e o Express se encarrega de passar os objetos 'req' (request) e 'res' (response) para ele quando a rota for chamada.
router.post("/users", userController.createUserController);

export default router;
