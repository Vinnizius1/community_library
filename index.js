import express from "express";
import userRouter from "./src/routes/user.routes.js";
// The variable userRouters is plural, but it represents a single express.Router() instance.
// Convention typically uses singular form (userRouter) for clarity.

const app = express();

app.use(express.json());
// Middleware para interpretar (parsear, transformar em objeto JS) JSON no corpo das requisições
// No Express, isso normalmente é feito com o middleware app.use(express.json()), que “parseia incoming requests with JSON payloads”
// e popula req.body com os dados já convertidos.
app.use(userRouter);
// Tem que ser EMBAIXO do express.json() para garantir que o corpo da requisição seja processado antes de chegar nas rotas.

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// O código acima é o ponto de entrada da aplicação, onde o servidor Express é configurado e iniciado.
// Ele importa as rotas de usuário, configura o middleware para processar JSON e inicia o servidor na porta definida.
