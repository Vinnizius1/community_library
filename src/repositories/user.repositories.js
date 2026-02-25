import db from "../config/database.js";
import { AppError } from "../errors/AppError.js";

/**
 * PADRÃO DE MERCADO: Data Access Layer (DAL)
 * O Repository é a única parte do sistema que "fala" SQL.
 * Isso isola o banco de dados do resto da aplicação.
 */

/**
 * Cria um novo usuário no banco.
 * @param {Object} newUser - Objeto contendo dados do usuário.
 * @returns {Promise<Object>} - Retorna o usuário criado (sem a senha).
 */

async function createUserRepository(newUser) {
  const { username, email, password, avatar } = newUser;

  /* 
    SEGURANÇA (SQL INJECTION): 
    Nunca usamos interpolação de strings como `VALUES (${username})`.
    Usamos "Parameterized Queries" ($1, $2...). O driver 'pg' limpa os dados 
    antes de enviar ao banco, evitando ataques hacker.
  */
  const query = `
    INSERT INTO users (username, email, password, avatar) 
    VALUES ($1, $2, $3, $4) 
    RETURNING id, username, email, avatar
  `;

  const values = [username, email, password, avatar];

  try {
    /* 
       MERCADO: O uso de async/await torna o código assíncrono muito mais legível.
       A cláusula RETURNING do Postgres é extremamente performática, pois evita 
       que tenhamos que fazer um novo SELECT para pegar o ID gerado.
    */
    const result = await db.query(query, values);

    // result.rows contém um array com os registros afetados.
    const createdUser = result.rows[0];

    return createdUser;
  } catch (err) {
    /* 
       TRATAMENTO DE ERRO: 
       Verificamos se é erro de violação de unicidade (código 23505 no Postgres).
    */
    if (err.code === "23505") {
      if (err.constraint === "users_email_key") {
        throw new AppError("Este e-mail já está em uso.", 409);
      } else if (err.constraint === "users_username_key") {
        throw new AppError("Este username já está em uso.", 409);
      } else {
        throw new AppError("Este e-mail ou username já está em uso.", 409);
      }
    }
    /*
       Lançamos o erro para cima (Service) para que a regra de negócio decida 
       como responder ao usuário.
    */
    throw err;
  }
}

/**
 * Encontra um usuário por email (para validação de duplicidade).
 * ⚠️ IMPORTANTE: Esta função NÃO retorna a senha!
 * Use esta função APENAS para: verificar duplicidade, listar dados públicos do usuário.
 * Para autenticação (login/bcrypt), use findUserByEmailForAuthRepository().
 * @param {string} email - Email do usuário
 * @returns {Promise<Object|undefined>} - Usuário sem senha ou undefined
 */
async function findUserByEmailRepository(email) {
  const query = `
    -- Selecionamos colunas específicas para evitar trazer a senha (hash) acidentalmente
    SELECT id, username, email, avatar FROM users WHERE email = $1
  `;

  const result = await db.query(query, [email]);
  return result.rows[0]; // Retorna o usuário encontrado ou undefined.
}

/**
 * Encontra um usuário por email com senha incluída (para autenticação).
 * ⚠️ SEGURANÇA: Esta função retorna a senha (hash)!
 * Use esta função APENAS em: login, comparação bcrypt, fluxos de autenticação.
 * NUNCA retorne os dados desta função diretamente ao cliente.
 * @param {string} email - Email do usuário
 * @returns {Promise<Object|undefined>} - Usuário com senha (hash) ou undefined
 */
async function findUserByEmailForAuthRepository(email) {
  const query = `
    -- Incluímos a senha pois esta função é APENAS para autenticação (bcrypt compare)
    SELECT id, username, email, avatar, password FROM users WHERE email = $1
  `;
  const result = await db.query(query, [email]);
  return result.rows[0]; // Retorna o usuário encontrado ou undefined.
}

export default {
  createUserRepository,
  findUserByEmailRepository,
  findUserByEmailForAuthRepository,
};
