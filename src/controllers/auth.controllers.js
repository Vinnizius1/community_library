// O Garçom da autenticação. Sem lógica, só orquestra:

import authService from "../service/auth.service.js";
import { AppError } from "../errors/AppError.js";

async function loginController(req, res) {
  try {
    const result = await authService.loginService(req.body);

    // 200 OK: Login realizado com sucesso (não é 201, pois não criamos recurso)
    return res.status(200).json(result);
  } catch (error) {
    console.error({ message: error.message, stack: error.stack });

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    return res.status(500).json({ message: "Erro interno do servidor." });
  }
}

export default { loginController };
