import db from "../config/database.js";
import { AppError } from "../errors/AppError.js";
import { sanitizePagination } from "../utils/pagination.utils.js";

/**
 * Insere um novo livro no banco de dados.
 * @param {Object} newBook - Dados do livro (title, author, description, image, userId).
 * @returns {Promise<Object>} - O livro criado.
 */
async function createBookRepository(newBook) {
  const { title, author, description, image, userId } = newBook;

  const query = `
    INSERT INTO books (title, author, description, image, user_id) 
    VALUES ($1, $2, $3, $4, $5) 
    RETURNING id, title, author, description, image, user_id
  `;

  const values = [title, author, description, image, userId];

  try {
    const result = await db.query(query, values);
    return result.rows[0];
  } catch (err) {
    // Tratamento de erro para títulos duplicados (se houver UNIQUE constraint)
    if (err.code === "23505") {
      throw new AppError("Já existe um livro cadastrado com este título.", 409);
    }
    throw err;
  }
}

/**
 * Lista livros com paginação.
 * @param {number} limit - Quantidade de registros.
 * @param {number} offset - Quantidade de registros a pular.
 * @returns {Promise<Array>} - Lista de livros.
 */
async function findAllBooksRepository(limit = 100, offset = 0) {
  const { safeLimit, safeOffset } = sanitizePagination(limit, offset);

  const query = `
    SELECT id, title, author, description, image, user_id 
    FROM books
    ORDER BY id DESC
    LIMIT $1 OFFSET $2
  `;
  const result = await db.query(query, [safeLimit, safeOffset]);
  return result.rows;
}

/**
 * Busca um livro pelo ID.
 * @param {number} id - ID do livro.
 * @returns {Promise<Object|undefined>}
 */
async function findBookByIdRepository(id) {
  const query = `
    SELECT id, title, author, description, image, user_id 
    FROM books 
    WHERE id = $1
  `;
  const result = await db.query(query, [id]);
  return result.rows[0];
}

/**
 * Atualiza um livro de forma dinâmica.
 * @param {number} id - ID do livro.
 * @param {Object} bookData - Dados para atualizar.
 * @returns {Promise<Object>} - O livro atualizado.
 */
async function updateBookRepository(id, bookData) {
  // Whitelist de campos permitidos
  const ALLOWED_FIELDS = ["title", "author", "description", "image"];

  const fields = Object.keys(bookData).filter(
    (key) => bookData[key] !== undefined && ALLOWED_FIELDS.includes(key),
  );

  if (fields.length === 0) {
    throw new AppError("Nenhum campo válido para atualização fornecido.", 400);
  }

  // Montagem da query dinâmica ($1, $2...)
  const setClause = fields
    .map((key, index) => `"${key}" = $${index + 1}`)
    .join(", ");

  const values = fields.map((key) => bookData[key]);

  const query = `
    UPDATE books 
    SET ${setClause} 
    WHERE id = $${fields.length + 1} 
    RETURNING id, title, author, description, image, user_id
  `;

  let result;
  try {
    result = await db.query(query, [...values, id]);
  } catch (err) {
    if (err.code === "23505") {
      throw new AppError("Este título já está em uso por outro livro.", 409);
    }
    throw err;
  }

  if (result.rowCount === 0) {
    throw new AppError("Livro não encontrado.", 404);
  }

  return result.rows[0];
}

/**
 * Exclui um livro.
 * @param {number} id - ID do livro.
 * @returns {Promise<number>}
 */
async function deleteBookRepository(id) {
  const query = `DELETE FROM books WHERE id = $1`;
  const result = await db.query(query, [id]);
  if (result.rowCount === 0) {
    throw new AppError("Livro não encontrado.", 404);
  }
  return result.rowCount;
}

/**
 * Busca livros por título (útil para pesquisa).
 * @param {string} title - Termo de busca.
 * @returns {Promise<Array>}
 */
async function searchBooksByTitleRepository(title, limit = 100, offset = 0) {
  const { safeLimit, safeOffset } = sanitizePagination(limit, offset);

  const query = `
    SELECT id, title, author, description, image, user_id 
    FROM books 
    WHERE title ILIKE $1
    ORDER BY id DESC
    LIMIT $2 OFFSET $3
  `;
  const result = await db.query(query, [`%${title}%`, safeLimit, safeOffset]);
  return result.rows;
}
export default {
  createBookRepository,
  findAllBooksRepository,
  findBookByIdRepository,
  updateBookRepository,
  deleteBookRepository,
  searchBooksByTitleRepository,
};
