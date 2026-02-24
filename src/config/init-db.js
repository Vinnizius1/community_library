import db from "./database.js";

/*
  SCRIPT DE INICIALIZAÇÃO DO BANCO DE DADOS (MIGRATION SIMPLES)
  
  Este arquivo deve ser executado manualmente via linha de comando para criar as tabelas necessárias.
  Comando: node src/config/init-db.js
*/

async function initDb() {
  try {
    console.log("Iniciando criação de tabelas...");

    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        avatar TEXT
      )
    `);

    console.log("Tabela 'users' criada (ou já existente) com sucesso!");
  } catch (error) {
    console.error("Erro ao inicializar o banco de dados:", error);
  } finally {
    // Encerra a conexão com o banco para o script não ficar rodando eternamente
    await db.end();
  }
}

initDb();
