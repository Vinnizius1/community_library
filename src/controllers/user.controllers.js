/**
 * Este arquivo define o controller para a criação de usuários.
 *
 * A função `createUserController` é responsável por receber os dados do novo usuário
 * a partir do corpo da requisição (request body), passá-los para a camada de serviço
 * (`userService`) que fará a lógica de criação, e então enviar uma resposta
 * ao cliente com o resultado da operação.
 */
import userService from "../service/user.services.js";
import { AppError } from "../errors/AppError.js";

/**
 * Helper function para sanitizar e logar erros de forma segura
 * Remove PII (emails, telefones, credenciais) e loga apenas campos não-sensíveis
 * @param {Error} error - O objeto de erro a ser logado
 * @param {Object} logger - Logger opcional (ex: processLogger). Usa console.error como fallback
 * @returns {void}
 */
function safeLogError(error, logger = null) {
  // Sanitizador: redacta dados sensíveis (emails, telefones, tokens, credenciais)
  const sanitize = (str) => {
    let s = String(str)
      .replace(/[\w\.-]+@[\w\.-]+\.\w+/g, "[email redacted]") // Emails
      .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, "[phone redacted]") // Telefones
      .replace(
        /(password|secret|token|apikey|key|authorization|bearer)\s*[:=]\s*[^\s,}]*/gi,
        "$1=[redacted]",
      ) // Credenciais
      .replace(/mongodb:\/\/[^\s]*/gi, "mongodb://[redacted]") // Connection strings
      .replace(/postgres:\/\/[^\s]*/gi, "postgres://[redacted]"); // DB URLs
    return s.slice(0, 150); // Limite a 150 caracteres
  };

  // Extrair apenas campos não-sensíveis para logging estruturado
  let safeLogs = {
    errorType: "Unknown",
    errorMessage: "[internal error — message redacted]",
    errorCode: null,
    stackFrames: [],
  };

  if (error instanceof Error) {
    safeLogs.errorType = error.name; // Ex: TypeError, ReferenceError, ValidationError
    safeLogs.errorMessage = sanitize(error.message);
    safeLogs.errorCode = error.code || null; // Ex: ENOENT, ECONNREFUSED (DB connection errors)

    // Sanitizar stack traces (remover primeira linha, sanitizar dados sensíveis)
    if (error.stack) {
      safeLogs.stackFrames = error.stack
        .split("\n")
        .slice(1) // Remove a primeira linha que contém error.name + error.message
        .map((line) => sanitize(line))
        .filter((line) => line.trim()); // Remove linhas vazias
    }
  } else {
    // Para non-Error throws: criar resumo seguro
    safeLogs.errorType = typeof error;
    safeLogs.errorMessage = sanitize(error);
  }

  // Usar logger fornecido ou fallback para console.error
  const logFunction = logger ? logger.error : console.error;
  logFunction(safeLogs);
}

async function createUserController(req, res) {
  const newUser = req.body;

  try {
    const createdUser = await userService.createUserService(newUser);
    // O service retorna o usuário criado (já sem a senha),
    // e o controller é responsável por enviar a resposta HTTP, ou seja,
    // formata a resposta final para o cliente.
    return res.status(201).json({
      message: "Usuário criado com sucesso!",
      user: createdUser,
    });
  } catch (error) {
    // Log do erro usando helper seguro (sanitiza PII e loga apenas campos não-sensíveis)
    safeLogError(error);

    // Verifica se o erro é uma instância da nossa classe personalizada AppError
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    // Para qualquer outro erro desconhecido (banco de dados, bugs), retornamos 500 e uma mensagem genérica
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
}

export default { createUserController };
