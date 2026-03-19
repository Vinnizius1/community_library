import jwt from "jsonwebtoken";

/**
 * Gera um token JWT para um usuário autenticado.
 * @param {number} id - O ID do usuário
 * @returns {string} - O token JWT assinado
 */
function generateJWT(id) {
  // Validação básica do ID do usuário para garantir que seja um número ou string válida.
  if (!id || (typeof id !== "number" && typeof id !== "string")) {
    throw new Error("Invalid user ID");
  }

  // Verificação de configuração do segredo JWT para evitar erros de runtime.
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  // The jwt.sign operation can fail (e.g., invalid secret format, serialization errors).
  // Without error handling, failures will propagate unexpectedly.
  // Wrapping in a try-catch block allows us to handle such errors gracefully and provide meaningful feedback.
  try {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
  } catch (error) {
    throw new Error("Failed to generate JWT");
  }
}

export default { generateJWT };
