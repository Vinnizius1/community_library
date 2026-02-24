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
    // Remove a primeira linha do stack (que contém a mensagem de erro) para não vazar dados sensíveis
    if (error instanceof Error) {
      const frames = error.stack?.split("\n").slice(1);
      if (frames && frames.length > 0) {
        console.error({ stackFrames: frames });
      } else {
        console.error({
          type: typeof error,
          preview: String(error).slice(0, 100),
        });
      }
    } else {
      // Para non-Error throws, cria um safe Error wrapper
      const safe = new Error();
      safe.stack = new Error(String(error)).stack;
      const frames = safe.stack?.split("\n").slice(1);
      if (frames && frames.length > 0) {
        console.error({ stackFrames: frames });
      } else {
        console.error({
          type: typeof error,
          preview: String(error).slice(0, 100),
        });
      }
    }
    // Define o código de saída como erro (1), mas permite que o 'finally' execute antes de fechar.
    initDb().catch((err) => {
      console.error("Erro fatal ao encerrar a conexão:", err);
      process.exit(1);
    });
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
