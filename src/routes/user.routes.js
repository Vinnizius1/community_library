import { Router } from "express";
import userController from "../controllers/user.controllers.js";
import { validate } from "../middlewares/validation.middlewares.js";
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

export default router;
