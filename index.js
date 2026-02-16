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

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
