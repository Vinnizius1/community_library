import { Router } from "express";
import userController from "../controllers/user.controllers.js";
import {
  validate,
  validateNumericId,
} from "../middlewares/validation.middlewares.js";
import { userSchema } from "../schema/user.schema.js";

const router = Router();

// 1ª Rota
// Não preciso passar 'req' e 'res' aqui, pois o router do Express já os fornece automaticamente.
// O middleware 'validate' vai rodar antes do controller.
router.post(
  "/users",
  validate(userSchema),
  userController.createUserController,
);

// 2ª Rota
router.get("/users", userController.findAllUsersController);

// 3ª Rota
// O ':id' é um parâmetro de rota OBRIGATÓRIO, que pode ser acessado no controller via 'req.params.id'
// O middleware 'validateNumericId' valida que o ID é um número inteiro positivo antes de invocar o controller
router.get(
  "/users/:id",
  validateNumericId,
  userController.findUserByIdController,
);

export default router;
