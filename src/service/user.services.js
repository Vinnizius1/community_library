/*
  A camada de serviço (service layer) é responsável por conter a lógica e REGRAS de negócio da aplicação.
  Ela atua como um intermediário entre a camada de controle (controllers) e a camada de acesso a dados (repositories).
  Essa separação de responsabilidades promove um código mais organizado, testável e de fácil manutenção.
  Aqui acontece a validação de dados, regras de negócio, e a orquestração das chamadas aos repositórios.
  Exemplo: o que acontece se tentarmos criar dois usuários com o mesmo e-mail? 
  O Postgres vai dar um erro de "Unique Constraint". 
  O seu Service deve saber capturar isso e enviar uma mensagem amigável para o usuário.

*/

import userRepositories from "../repositories/user.repositories.js";
import { AppError } from "../errors/AppError.js";
import bcrypt from "bcrypt";

/**
 * SERVIÇO DE CRIAÇÃO DE USUÁRIO
 * Aqui aplicamos as "Regras de Negócio" antes de tocar no banco.
 */
async function createUserService(newUser) {
  const { username, email, password, avatar } = newUser;

  // 1. VALIDAÇÃO BÁSICA: Já foi feita pelo Zod no middleware! O código aqui chega limpo.

  // 2. REGRA DE NEGÓCIO: Verificar se o usuário já existe
  // Verifica duplicidade de e-mail
  const userAlreadyExists =
    await userRepositories.findUserByEmailRepository(email);

  if (userAlreadyExists) {
    /* 
       Lançar um erro aqui interrompe a execução. 
       O Controller vai capturar esse erro no 'catch'.
    */
    // 409 Conflict: O recurso já existe
    throw new AppError(
      "Este e-mail já está sendo utilizado por outro usuário.",
      409,
    );
  }

  // 3. SEGURANÇA: Criptografar a senha (Hash)
  // O número 10 é o "custo" (salt rounds). Quanto maior, mais seguro e mais lento. 10 é o padrão de mercado.
  const passwordHash = await bcrypt.hash(password, 10);

  // 4. ORQUESTRAÇÃO: Cria um novo objeto com a senha criptografada e manda para o banco
  const newUserWithHash = { ...newUser, password: passwordHash };
  const createdUser =
    await userRepositories.createUserRepository(newUserWithHash);

  const { password: _, ...userWithoutPassword } = createdUser;
  return userWithoutPassword;
}

export default { createUserService };
