import "dotenv/config"; // Carrega as variáveis de ambiente do arquivo .env logo no início
import express from "express";
import userRouter from "./src/routes/user.routes.js";
import { errorHandler } from "./src/middlewares/errorHandler.middleware.js";

const app = express();

app.use(express.json());
// Middleware para interpretar (parsear, transformar em objeto JS) JSON no corpo das requisições
// No Express, isso normalmente é feito com o middleware app.use(express.json()), que “parseia incoming requests with JSON payloads”
// e popula req.body com os dados já convertidos.
app.use(userRouter);
// Tem que ser EMBAIXO do express.json() para garantir que o corpo da requisição seja processado antes de chegar nas rotas.

// O Error Handler DEVE ser o último app.use, mas ANTES do app.listen
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
