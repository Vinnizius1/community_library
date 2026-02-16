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

async function createUserController(req, res) {
  const newUser = req.body;

  try {
    const serviceResponse = await userService.createUserService(newUser);
    // O service já retorna um objeto formatado { message, user }, então retornamos ele direto.
    // Usamos .json() para garantir o header Content-Type correto.
    return res.status(201).json(serviceResponse);
    /* 
    Add return for consistency with error handling paths.
    The error handling branches (lines 26, 30) use return res.status()... 
    but the success path omits return. While currently harmless, this inconsistency could cause unexpected behavior if code is added after this line in the future.
    */
  } catch (error) {
    // Log do erro real no console para o desenvolvedor debugar (não envie isso pro cliente!)
    console.error(error);

    // Verifica se o erro é uma instância da nossa classe personalizada AppError
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    // Para qualquer outro erro desconhecido (banco de dados, bugs), retornamos 500 e uma mensagem genérica
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
}

export default { createUserController };
