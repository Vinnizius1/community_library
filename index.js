import express from "express";
import userRouters from "./src/routes/user.routes.js";

const app = express();

// Middleware para interpretar JSON no corpo das requisições
app.use(express.json());
// Tem que ser EMBAIXO do express.json() para garantir que o corpo da requisição seja processado antes de chegar nas rotas.
app.use(userRouters);

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
