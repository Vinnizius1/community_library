# 📚 Community Library API

Bem-vindo ao repositório da **Community Library**! 🚀

Este projeto é uma API RESTful para gerenciamento de uma biblioteca comunitária. Ele foi iniciado como parte de um projeto guiado pelo professor **Thiago Veiga** na **Escola DNC**.

## 💡 Evolução do Projeto

Originalmente proposto com **SQLite**, decidi desafiar-me e evoluir a stack para tecnologias mais robustas e utilizadas no mercado de trabalho atual.

**Principais Diferenciais:**

- **Banco de Dados:** Migração de SQLite para **PostgreSQL**.
- **Arquitetura:** Implementação do padrão **MSC** (Model/Repository - Service - Controller) para melhor organização e escalabilidade.
- **Segurança:** Implementação de hash de senhas com `bcrypt` e validações de segurança.

## 🛠️ Tecnologias Utilizadas

- **Node.js** & **Express**: Base da API.
- **PostgreSQL** (`pg`): Banco de dados relacional robusto.
- **Bcrypt**: Para criptografia segura de senhas.
- **Dotenv**: Gerenciamento de variáveis de ambiente.
- **Docker Compose**: Para containerização do banco de dados.

## ⚙️ Funcionalidades (Até o momento)

- **Usuários**:
  - Criação de conta (`POST /users`).
  - Validação de dados de entrada (Campos obrigatórios, tamanho de senha).
  - Verificação de e-mail único.
  - Criptografia de senha.
  - Tratamento de erros unificado (`AppError`).

## 🚀 Como Rodar o Projeto

### Pré-requisitos

- Node.js
- PostgreSQL (Instalado localmente ou via Docker)

### Passo a Passo

1. **Clone o repositório**

   ```bash
   git clone <url-do-repositorio>
   cd community_library
   ```

2. **Instale as dependências**

   ```bash
   npm install
   ```

3. **Configure as Variáveis de Ambiente**
   Crie um arquivo `.env` na raiz do projeto e preencha com suas credenciais do Postgres:

   ```env
   DB_USER=seu_usuario
   DB_HOST=localhost
   DB_DATABASE=community_library
   DB_PASSWORD=sua_senha
   DB_PORT=5432
   ```

4. **Inicie o Servidor**
   ```bash
   npm start
   ```
   O servidor rodará em `http://localhost:3000`.

## 📝 Próximos Passos

Consulte o arquivo NEXT_STEPS.md para ver o roadmap de evolução técnica (ORM, Testes, JWT, etc).

---

Desenvolvido durante o curso da DNC.
