import express from "express";

const app = express();

// Middleware para interpretar JSON no corpo das requisições
app.use(express.json());

// Array de usuários - escopo global
const users = [];

// Nome da rota, depois a função callback (que TEM que ser anônima!)
/* app.get("/", (req, res) => {
  res.send("Hello World");
}); */

/* POST */
app.post("/users", (req, res) => {
  // "body" é o corpo da requisição com os dados enviados pelo cliente.
  const body = req.body;
  users.push(body);
  // Precisa enviar o "send" para finalizar a requisição!
  res.status(201).send("Usuário criado com sucesso!");
});

/* GET */
app.get("/users", (req, res) => {
  // res.json(users);

  // Esta a é melhor forma de responder ao usuário quando
  // retornar um objeto, ou os dados de um Banco de Dados para o cliente.
  // Porque primeiro cria a chave "data" e depois, dentro do array "users", coloca os dados dos usuários.
  // Além disso, adiciona uma mensagem com chave "message" e valor "Lista de usuários".
  res.send({ message: "Lista de usuários", data: users });
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
