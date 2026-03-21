import "dotenv/config"; // Carrega as variáveis de ambiente do arquivo .env logo no início
import express from "express";
import userRouter from "./src/routes/user.routes.js";
import { errorHandler } from "./src/middlewares/errorHandler.middleware.js";
import initDb from "./src/config/init-db.js";

const app = express();
const PORT = process.env.PORT || 3000;

// ============ CONFIGURAÇÃO DO SERVIDOR ============
// Middleware para parsear JSON no corpo das requisições.
// Popula req.body com os dados já convertidos para objeto JS.
// DEVE vir antes das rotas para garantir que req.body esteja disponível nos controllers.
app.use(express.json());

// ============ ROTAS ============
app.use(userRouter);

// ============ TRATAMENTO DE ERROS ============
// O errorHandler DEVE ser o último app.use, pois o Express identifica
// middlewares de erro pela assinatura (err, req, res, next).
// Qualquer erro lançado nas rotas acima chegará aqui.
app.use(errorHandler);

// ============ INICIALIZAÇÃO ============
/**
 * Função de bootstrap: inicializa a aplicação na ordem correta.
 * 1. Banco de dados primeiro — sem banco, não faz sentido abrir o servidor.
 * 2. Só após a conexão ser confirmada, o servidor começa a aceitar requisições.
 * Isso previne requisições chegando antes do banco estar pronto.
 */
async function bootstrap() {
  try {
    await initDb();

    const server = app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });

    // Captura erros de inicialização do servidor (ex: porta em uso - EADDRINUSE)
    server.on("error", (err) => {
      console.error("❌ Erro ao iniciar servidor Express:", err);
      process.exit(1);
    });
  } catch (err) {
    console.error("Aplicação não pôde iniciar devido ao banco de dados:", err);
    process.exit(1); // Encerra o processo com código de erro (não-zero = falha)
  }
}

bootstrap();
