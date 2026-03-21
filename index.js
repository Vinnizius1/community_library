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

    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  } catch (err) {
    console.error("Aplicação não pôde iniciar devido ao banco de dados:", err);
    process.exit(1); // Encerra o processo com código de erro (não-zero = falha)
  }
}

bootstrap();

/* 
O que mudou e por quê
1. PORT subiu para o topo — constantes de configuração ficam antes da lógica. Organização.

2. app.use() fora do bootstrap — os middlewares e rotas são configuração estática, não dependem do banco. Só o listen precisa esperar o initDb.

3. try/catch em vez de .catch() — dentro de uma função async, o try/catch é mais legível e o Rabbit prefere esse padrão por ser consistente com o resto do código.

4. initDb e app.listen agora têm ordem garantida — o servidor só abre depois que o banco confirmar conexão. Esse era o único risco real do código anterior.
*/
