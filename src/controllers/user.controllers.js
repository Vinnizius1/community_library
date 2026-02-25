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
import { parsePhoneNumber } from "libphonenumber-js";
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
    let s = String(str);

    // Redactar emails
    s = s.replace(/[\w\.-]+@[\w\.-]+\.\w+/g, "[email redacted]");

    // Redactar números de telefone usando libphonenumber-js com fallback
    // Regex que captura: +55 11 9 1234-5678, (11) 91234-5678, +1 555 123 4567, etc
    const phoneRegex =
      /(?:\+\d{1,3}[\s\-]?)?(?:\(?\d{1,4}\)?[\s\-]?)?(?:9[\s\-]?)?\d{3,4}[\s\-]?\d{3,4}/g;
    s = s.replace(phoneRegex, (match) => {
      try {
        // Tenta parse com país padrão BR
        const parsed = parsePhoneNumber(match, "BR");
        if (parsed && parsed.isValid && parsed.isValid()) {
          return "[phone redacted]";
        } else {
          return match;
        }
      } catch (e) {
        // Se falhar com BR, tenta sem país (E.164 format)
        try {
          const parsed = parsePhoneNumber(match);
          if (parsed && parsed.isValid && parsed.isValid()) {
            return "[phone redacted]";
          } else {
            return match;
          }
        } catch (e2) {
          // Se ambas falhas, não é um telefone válido, manter original
          return match;
        }
      }
    });

    // Redactar credenciais
    s = s.replace(
      /(password|secret|token|apikey|key|authorization|bearer)\s*[:=]\s*[^\s,}]*/gi,
      "$1=[redacted]",
    );

    // Redactar connection strings (MongoDB, PostgreSQL, etc)
    s = s.replace(/mongodb:\/\/[^\s]*/gi, "mongodb://[redacted]");
    s = s.replace(/postgres:\/\/[^\s]*/gi, "postgres://[redacted]");

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
    safeLogs.errorType = sanitize(error.name); // Ex: TypeError, ReferenceError, ValidationError
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
  if (logger) {
    logger.error(safeLogs);
  } else {
    console.error(safeLogs);
  }
}

async function createUserController(req, res) {
  const newUser = req.body;

  try {
    const createdUser = await userService.createUserService(newUser);
    // O service retorna o usuário criado (já sem a senha),
    // e o controller é responsável por enviar a resposta HTTP, ou seja,
    // formata a resposta final para o cliente.
    // Defensivamente, removemos campos sensíveis antes de retornar
    const safeUser = {
      id: createdUser.id,
      username: createdUser.username,
      email: createdUser.email,
      avatar: createdUser.avatar,
    };
    return res.status(201).json({
      message: "Usuário criado com sucesso!",
      user: safeUser,
    });
  } catch (error) {
    // Verifica se o erro é uma instância da nossa classe personalizada AppError
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    // Para qualquer outro erro desconhecido (banco de dados, bugs), loga e retornamos 500 e uma mensagem genérica
    safeLogError(error);
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
}

export default { createUserController };
