import db from "../config/database.js";

/* 
   TABELA NO POSTGRES 
   Mudamos INTEGER PRIMARY KEY AUTOINCREMENT para SERIAL PRIMARY KEY
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
).catch((err) => console.error("Erro ao criar tabela:", err));

async function createUserRepository(newUser) {
  const { username, email, password, avatar } = newUser;

  // No Postgres usamos db.query (do pacote 'pg') e retornamos os dados com RETURNING
  const query = `
    INSERT INTO users (username, email, password, avatar) 
    VALUES ($1, $2, $3, $4) 
    RETURNING id, username, email, avatar
  `;

  const values = [username, email, password, avatar];

  try {
    const result = await db.query(query, values);

    // O Postgres retorna um objeto onde os dados ficam em result.rows
    const createdUser = result.rows[0];

    return {
      message: "Usuário criado com sucesso!",
      user: createdUser,
    };
  } catch (err) {
    throw err; // O Service vai capturar esse erro
  }
}

export default { createUserRepository };
