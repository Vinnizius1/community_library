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
    const user = await userService.createUserService(newUser);
    res.status(201).send({ user });
  } catch (error) {
    res.status(400).send(error.message);
  }
}

export default { createUserController };
