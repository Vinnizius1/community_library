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
    const createdUser = await userService.createUserService(newUser);
    // O service retorna o usuário criado (já sem a senha),
    // e o controller é responsável por enviar a resposta HTTP, ou seja,
    // formata a resposta final para o cliente.
    return res.status(201).json({
      message: "Usuário criado com sucesso!",
      user: createdUser,
    });
  } catch (error) {
    // Log do erro real no console para o desenvolvedor debugar (não envie isso pro cliente!)
    // CodeRabbit: Logar apenas o necessário para evitar vazamento de dados sensíveis (PII)
    console.error({
      message: error.message,
      stack: error.stack,
    });

    // Verifica se o erro é uma instância da nossa classe personalizada AppError
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    // Para qualquer outro erro desconhecido (banco de dados, bugs), retornamos 500 e uma mensagem genérica
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
}

export default { createUserController };
