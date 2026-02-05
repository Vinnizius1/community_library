/* CÓDIGO ANTIGO:

import sqlite3 from "sqlite3";

const db = new sqlite3.Database("library_db.sqlite", (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to the SQLite database.");
  }
});

export default db; */

// CÓDIGO NOVO:

import pg from "pg";
import "dotenv/config";

const { Pool } = pg;

// O Pool gerencia várias conexões ao banco de dados automaticamente
const db = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Teste de conexão inicial
db.connect()
  .then(() => {
    console.log("✅ Conectado ao PostgreSQL com sucesso!");
  })
  .catch((err) => {
    console.error("❌ Erro ao conectar no Postgres:", err.stack);
  });

export default db;
