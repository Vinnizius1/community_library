import jwt from "jsonwebtoken";

/**
 * Gera um token JWT para um usuário autenticado.
 * @param {number} id - O ID do usuário
 * @returns {string} - O token JWT assinado
 */
function generateJWT(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

export default { generateJWT };
