// O Chef de Cozinha da autenticação. Ele aplica as regras de negócio do login:

import bcrypt from "bcrypt";
import { generateJWT } from "../utils/jwt.utils.js";
import userRepositories from "../repositories/user.repositories.js";
import { AppError } from "../errors/AppError.js";

/**
 * REGRA DE SEGURANÇA CRÍTICA: Mensagem genérica proposital.
 * Nunca diga se foi o e-mail ou a senha que está errado.
 * Se um atacante sabe que o e-mail existe, ele só precisa quebrar a senha.
 */
const INVALID_CREDENTIALS_MSG = "E-mail ou senha inválidos.";

async function loginService({ email, password }) {
  // 1. BUSCA: Precisamos do hash da senha para comparar — usamos a função de auth
  const user = await userRepositories.findUserByEmailForAuthRepository(email);

  // 2. REGRA DE NEGÓCIO: Usuário não existe?
  // Retornamos a mesma mensagem genérica de senha errada (segurança!)
  if (!user) {
    throw new AppError(INVALID_CREDENTIALS_MSG, 401);
  }

  // 3. SEGURANÇA: Compara a senha enviada com o hash salvo no banco
  // bcrypt.compare faz o hash da senha digitada e compara com o hash salvo
  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    throw new AppError(INVALID_CREDENTIALS_MSG, 401);
  }

  // 4. TOKEN: Credenciais válidas — gera o crachá digital
  const token = generateJWT(user.id);

  // 5. RESPOSTA: Retorna dados públicos + token (sem a senha!)
  const { password: _password, ...safeUser } = user;
  return { user: safeUser, token };
}

export default { loginService };
