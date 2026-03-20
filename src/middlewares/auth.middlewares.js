// O Porteiro das Rotas Protegidas. Diferente do Zod (que verifica dados), este verifica identidade:

import { verifyJWT } from "../utils/jwt.utils.js";
import { AppError } from "../errors/AppError.js";

/**
 * Middleware de autenticação JWT.
 * Extrai e valida o token do header Authorization.
 * Se válido, injeta o userId no req para uso nas próximas camadas.
 */
export function authMiddleware(req, res, next) {
  try {
    // 1. Pega o header: "Authorization: Bearer eyJhbG..."
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AppError("Token não fornecido.", 401);
    }

    // 2. Separa "Bearer" do token em si
    const [scheme, token] = authHeader.split(" ");

    // 3. Valida o formato (deve ser exatamente "Bearer <token>")
    if (scheme !== "Bearer" || !token) {
      throw new AppError("Formato de token inválido. Use: Bearer <token>", 401);
    }

    // 4. Verifica assinatura e expiração — lança AppError se inválido
    const decoded = verifyJWT(token);

    // 5. INJETA o userId no req para que controllers/services possam usar
    // req.userId agora está disponível em todas as rotas protegidas
    req.userId = decoded.userId;

    next();
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
}
