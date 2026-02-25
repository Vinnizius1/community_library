import db from "./database.js";

/*
  SCRIPT DE INICIALIZAÇÃO DO BANCO DE DADOS (MIGRATION SIMPLES)
  
  Este arquivo deve ser executado manualmente via linha de comando para criar as tabelas necessárias.
  Comando: node src/config/init-db.js
*/

function extractErrorInfo(error) {
  let stack;
  if (error instanceof Error) {
    stack = error.stack;
  } else {
    stack = new Error(String(error)).stack;
  }
  const frames = stack?.split("\n").slice(1);
  if (frames && frames.length > 0) {
    return { stackFrames: frames };
  } else {
    if (error instanceof Error) {
      return { type: typeof error, message: "[error message redacted]" };
    } else {
      return { type: typeof error, preview: String(error).slice(0, 100) };
    }
  }
}

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
    console.error(extractErrorInfo(error));
    // ⚠️ CRÍTICO: Relançar o erro após log é ESSENCIAL.
    // Nunca chamar initDb() novamente aqui (fire-and-forget) pois:
    // 1. Não há await → retry ocorre de forma assíncrona
    // 2. finally já vai fechar db.end(), deixando a conexão indisponível
    // 3. retry falha contra conexão fechada
    // Solução: logar o erro e relançar para propagação até o handler top-level.
    console.error("Erro ao inicializar banco de dados:", error);
    throw error;
  } finally {
    // Encerra a conexão com o banco para o script não ficar rodando eternamente
    // A propagação do erro ocorre APÓS o finally (garantido por semântica try-finally)
    await db.end();
  }
}

// Tratamento de erro na chamada da função principal para evitar falhas silenciosas em Node < 15
initDb().catch((err) => {
  console.error("Erro fatal não tratado:", err);
  process.exit(1);
});
