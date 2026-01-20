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
          resolve({
            message: "Usuário criado com sucesso!",
            userId: this.lastID,
          });
        }
      },
    );
  });
}

export default { createUserRepository };
