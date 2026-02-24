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
      throw new AppError("Este e-mail ou username já está em uso.", 409);
    }
    /*
       Lançamos o erro para cima (Service) para que a regra de negócio decida 
       como responder ao usuário.
    */
    throw err;
  }
}

// Função para encontrar um usuário por email (usada para validação de duplicidade)
async function findUserByEmailRepository(email) {
  const query = `
    SELECT * FROM users WHERE email = $1
  `;
  const result = await db.query(query, [email]);
  return result.rows[0]; // Retorna o usuário encontrado ou undefined. Se underfined, o Service sabe que pode criar um novo usuário com esse email.
}

export default { createUserRepository, findUserByEmailRepository };
