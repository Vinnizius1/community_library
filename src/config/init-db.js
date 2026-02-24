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
        password TEXT NOT NULL, -- must always store a hashed value (bcrypt/argon2)
        avatar TEXT
      )
    `);

    console.log("Tabela 'users' criada (ou já existente) com sucesso!");
  } catch (error) {
    console.error("Erro ao inicializar o banco de dados:", error);
    // Define o código de saída como erro (1), mas permite que o 'finally' execute antes de fechar.
    process.exitCode = 1;
  } finally {
    // Encerra a conexão com o banco para o script não ficar rodando eternamente
    await db.end();
  }
}

// Tratamento de erro na chamada da função principal para evitar falhas silenciosas em Node < 15
initDb().catch((err) => {
  console.error("Erro fatal não tratado:", err);
  process.exit(1);
});
