/*
  A camada de serviço (service layer) é responsável por conter a lógica de negócio da aplicação.
  Ela atua como um intermediário entre a camada de controle (controllers) e a camada de acesso a dados (repositories).
  Essa separação de responsabilidades promove um código mais organizado, testável e de fácil manutenção.
*/
import userRepositories from "../repositories/user.repositories.js";

// Regras de negócio para criação de usuário
// A função createUserRepository gera, retorna uma Promise ("resolve" ou "reject" da promessa)
async function createUserService(newUser) {
  const user = await userRepositories.createUserRepository(newUser);
  return user;
}

export default { createUserService };
