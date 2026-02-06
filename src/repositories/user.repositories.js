import db from "../config/database.js";

/**
 * PADRÃO DE MERCADO: Data Access Layer (DAL)
 * O Repository é a única parte do sistema que "fala" SQL.
 * Isso isola o banco de dados do resto da aplicação.
 */

/* 
  BOA PRÁTICA: Inicialização de Tabelas.
  Em projetos reais, usamos "Migrations". Para este estágio, garantimos que a 
  tabela existe assim que o servidor sobe. 
  No Postgres, usamos SERIAL para IDs autoincrementais.
*/
db.query(
  `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      avatar TEXT
    ) 
`,
).catch((err) => console.error("Erro crítico ao criar tabela users:", err));

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

    return {
      message: "Usuário criado com sucesso!",
      user: createdUser,
    };
  } catch (err) {
    /* 
       TRATAMENTO DE ERRO: 
       Lançamos o erro para cima (Service) para que a regra de negócio decida 
       como responder ao usuário.
    */
    throw err;
  }
}

//
async function findUserByEmailRepository(email) {
  const query = `
    SELECT * FROM users WHERE email = $1
  `;
  const result = await db.query(query, [email]);
  return result.rows[0]; // Retorna o usuário encontrado ou undefined
}

export default { createUserRepository, findUserByEmailRepository };
