import db from "../config/database.js";
import { AppError } from "../errors/AppError.js";

/**
 * PADRÃO DE MERCADO: Data Access Layer (DAL)
 * O Repository é a única parte do sistema que "fala" SQL.
 * Isso isola o banco de dados do resto da aplicação.
 */

/**
 * Insere um novo registro de usuário no banco de dados PostgreSQL.
 * 🛡️ SEGURANÇA: Esta função utiliza a cláusula RETURNING para retornar apenas
 * dados públicos (id, username, email, avatar). O hash da senha é omitido.
 * @param {Object} newUser - Objeto contendo username, email, password e avatar.
 * @returns {Promise<Object>} - Promessa que resolve no objeto do usuário criado.
 */
async function createUserRepository(newUser) {
  const { username, email, password, avatar } = newUser;

  /* 
    SEGURANÇA (SQL INJECTION): 
    Nunca usamos interpolação de strings como `VALUES (${username})`.
    Usamos "Parameterized Queries" ($1, $2...). O driver 'pg' limpa os dados 
    antes de enviar ao banco, evitando ataques hacker.
  */
  // 1. O COMANDO (A Receita)
  const query = `
    INSERT INTO users (username, email, password, avatar) 
    VALUES ($1, $2, $3, $4) 
    RETURNING id, username, email, avatar
  `;

  // "values" é um array que corresponde aos placeholders ($1, $2, etc.) na query.
  // A ordem dos valores deve corresponder à ordem dos placeholders na query.
  // O driver 'pg' irá substituir $1 por username, $2 por email, etc.
  // "values" (Entrada) é o que você entrega para o banco guardar.
  // O "RETURNING" (Saída) é o que você recebe de volta do banco.
  // Ao omitir a senha do RETURNING, a variável "result" nunca terá acesso ao hash da senha.
  // 2. OS INGREDIENTES (Os Dados)
  const values = [username, email, password, avatar];

  try {
    /* 
       MERCADO: O uso de async/await torna o código assíncrono muito mais legível.
       A cláusula RETURNING do Postgres é extremamente performática, pois evita 
       que tenhamos que fazer um novo SELECT para pegar o ID gerado.
    */
    // 3. A EXECUÇÃO
    const result = await db.query(query, values);

    // result.rows contém um array com os registros afetados.
    // 4. O RESULTADO (O que volta para o JavaScript)
    const createdUser = result.rows[0];
    // { id: 1, username: "joao", email: "..." }
    // ^^^ A senha NÃO está aqui, garantindo que ela não vaze para o Frontend acidentalmente.

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

/**
 * Encontra um usuário por ID.
 * @param {number} id - ID do usuário
 * @returns {Promise<Object|undefined>} - Usuário ou undefined
 */
async function findUserByIdRepository(id) {
  const query = `
    SELECT id, username, email, avatar FROM users WHERE id = $1
  `;
  const result = await db.query(query, [id]);
  return result.rows[0]; // Retorna o usuário encontrado ou undefined.
}

/**
 * Lista usuários com paginação para evitar sobrecarga.
 * @param {number} limit - Máximo de registros a retornar (Default: 100)
 * @param {number} offset - Quantos registros pular (Default: 0)
 * @returns {Promise<Array>} - Array de usuários
 */
async function findAllUsersRepository(limit = 100, offset = 0) {
  const query = `
    SELECT id, username, email, avatar FROM users
    ORDER BY id
    LIMIT $1 OFFSET $2
  `;
  const result = await db.query(query, [limit, offset]);
  return result.rows;
}

/**
 * Atualiza um usuário existente no banco de dados de forma dinâmica.
 * A query é construída apenas com os campos fornecidos para atualização.
 * @param {number} id - ID do usuário a ser atualizado
 * @param {Object} userData - Objeto contendo os campos a serem atualizados (ex: { username, avatar })
 * @returns {Promise<Object>} - Promessa que resolve no objeto do usuário atualizado (sem senha)
 */
async function updateUserRepository(id, userData) {
  // Filtra apenas os campos que foram fornecidos para atualização.
  const fields = Object.keys(userData).filter(
    (key) => userData[key] !== undefined,
  );

  // Se nenhum campo foi fornecido, não há nada a fazer.
  if (fields.length === 0) {
    throw new AppError("No fields to update provided.", 400);
  }

  // Constrói a cláusula SET dinamicamente: "username" = $1, "avatar" = $2, ...
  const setClause = fields
    .map((key, index) => `"${key}" = $${index + 1}`)
    .join(", ");

  // Cria o array de valores correspondente aos campos.
  const values = fields.map((key) => userData[key]);

  const query = `
    UPDATE users 
    SET ${setClause} 
    WHERE id = $${fields.length + 1} 
    RETURNING id, username, email, avatar`;

  try {
    const result = await db.query(query, [...values, id]);
    if (result.rowCount === 0) {
      throw new AppError("User not found or no data to update.", 404);
    }
    return result.rows[0];
  } catch (err) {
    // Reutiliza o tratamento de erro de e-mail/username duplicado
    if (err.code === "23505") {
      if (err.constraint === "users_email_key") {
        throw new AppError("Este e-mail já está em uso.", 409);
      } else if (err.constraint === "users_username_key") {
        throw new AppError("Este username já está em uso.", 409);
      }
    }
    throw err; // Lança outros erros para cima
  }
}

/**
 * Exclui um usuário do banco de dados.
 * @param {number} id - ID do usuário a ser excluído
 * @returns {Promise<number>} - Retorna o número de linhas afetadas (1 para sucesso, 0 se não encontrado).
 */
async function deleteUserRepository(id) {
  const query = `
    DELETE FROM users
    WHERE id = $1
    RETURNING id
  `;
  const result = await db.query(query, [id]);
  return result.rowCount;
}

export default {
  createUserRepository,
  findUserByEmailRepository,
  findUserByEmailForAuthRepository,
  findUserByIdRepository,
  findAllUsersRepository,
  updateUserRepository,
  deleteUserRepository,
};
