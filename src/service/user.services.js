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

  // 1. VALIDAÇÃO BÁSICA (O que o CodeRabbit sugeriu, mas feito manualmente)
  if (!username || !email || !password || !avatar) {
    throw new AppError(
      "Todos os campos são obrigatórios: username, email, password, avatar.",
    );
  }

  if (password.length < 6) {
    throw new AppError("A senha deve ter pelo menos 6 caracteres.");
  }

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

  // 5. RETORNO: Dados limpos e prontos para o Controller
  return createdUser;
}

export default { createUserService };
