/**
 * Este arquivo define o controller para a criação de usuários.
 *
 * A função `createUserController` é responsável por receber os dados do novo usuário
 * a partir do corpo da requisição (request body), passá-los para a camada de serviço
 * (`userService`) que fará a lógica de criação, e então enviar uma resposta
 * ao cliente com o resultado da operação.
 */
import userService from "../services/user.services.js";

async function createUserController(req, res) {
  const newUser = req.body;

  try {
    const serviceResponse = await userService.createUserService(newUser);
    // O service já retorna um objeto formatado { message, user }, então retornamos ele direto.
    // Usamos .json() para garantir o header Content-Type correto.
    res.status(201).json(serviceResponse);
  } catch (error) {
    // Padronização de erro em JSON
    res.status(400).json({ message: error.message });
  }
}

export default { createUserController };
