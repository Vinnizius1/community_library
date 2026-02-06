/*
  A camada de serviço (service layer) é responsável por conter a lógica de negócio da aplicação.
  Ela atua como um intermediário entre a camada de controle (controllers) e a camada de acesso a dados (repositories).
  Essa separação de responsabilidades promove um código mais organizado, testável e de fácil manutenção.
  Aqui acontece a validação de dados, regras de negócio, e a orquestração das chamadas aos repositórios.
  Exemplo: o que acontece se tentarmos criar dois usuários com o mesmo e-mail? 
  O Postgres vai dar um erro de "Unique Constraint". 
  O seu Service deve saber capturar isso e enviar uma mensagem amigável para o usuário.

*/
import userRepositories from "../repositories/user.repositories.js";

// Regras de negócio para criação de usuário
import userRepositories from "../repositories/user.repositories.js";

/**
 * SERVIÇO DE CRIAÇÃO DE USUÁRIO
 * Aqui aplicamos as "Regras de Negócio" antes de tocar no banco.
 */
async function createUserService(newUser) {
  const { email } = newUser;

  // 1. REGRA DE NEGÓCIO: Verificar se o usuário já existe
  const userAlreadyExists =
    await userRepositories.findUserByEmailRepository(email);

  if (userAlreadyExists) {
    /* 
       Lançar um erro aqui interrompe a execução. 
       O Controller vai capturar esse erro no 'catch'.
    */
    throw new Error("Este e-mail já está sendo utilizado por outro usuário.");
  }

  // 2. ORQUESTRAÇÃO: Se passou pela regra, manda para o banco
  const createdUser = await userRepositories.createUserRepository(newUser);

  // 3. RETORNO: Dados limpos e prontos para o Controller
  return createdUser;
}

export default { createUserService };
