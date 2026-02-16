import express from "express";
import userRouter from "./src/routes/user.routes.js";
// The variable userRouters is plural, but it represents a single express.Router() instance.
// Convention typically uses singular form (userRouter) for clarity.

const app = express();

app.use(express.json());
// Middleware para interpretar JSON no corpo das requisições
app.use(userRouter);
// Tem que ser EMBAIXO do express.json() para garantir que o corpo da requisição seja processado antes de chegar nas rotas.

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
