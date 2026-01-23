import db from "../config/database.js";

/* CRIAÇÃO DE TABELA */
db.run(`
    CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    avatar  TEXT
    ) 
`);

/* Não "inserimos" id pois ele é AUTOINCREMENT */
function createUserRepository(newUser) {
  return new Promise((resolve, reject) => {
    // Desestruturação do objeto "newUser"
    const { username, email, password, avatar } = newUser;

    // ".run()" recebe a query e a função de callback com "err"
    db.run(
      `INSERT INTO users (username, email, password, avatar) 
       VALUES (?, ?, ?, ?)`,
      [username, email, password, avatar],
      function (err) {
        if (err) {
          reject(err);
        } else {
          /*
            Boas práticas de mercado e segurança:
            Ao resolver a Promise, é crucial não retornar o objeto 'newUser' inteiro
            (usando "...newUser"), pois ele contém a senha do usuário.
            Senhas, mesmo que criptografadas (hash), nunca devem ser expostas ou
            trafegar em respostas de APIs ou logs após a autenticação/criação.

            A prática correta é criar um novo objeto contendo apenas as
            informações públicas e seguras do usuário, como id, username e email,
            evitando o vazamento de dados sensíveis.
          */
          resolve({
            message: "Usuário criado com sucesso!",
            user: {
              id: this.lastID,
              username: newUser.username,
              email: newUser.email,
              avatar: newUser.avatar,
            },
          });
        }
      },
    );
  });
}

export default { createUserRepository };
