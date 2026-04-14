# 📚 API de Biblioteca Comunitária

Uma API RESTful para gestão de bibliotecas comunitárias — desenvolvida com Node.js, Express e PostgreSQL.

## 💡 Sobre este Projeto

O projeto nasceu como uma aplicação guiada utilizando SQLite, mas foi evoluído como um desafio pessoal para atingir um nível de robustez de produção. Migrei o banco de dados para **PostgreSQL**, reestruturei a arquitetura para o padrão **MSC (Model/Repository – Service – Controller)** e implementei camadas de segurança e tratamento de erros avançadas.

**Principais decisões técnicas:**

- **Migração SQLite → PostgreSQL**: Foco em escalabilidade e simulação de ambientes reais de mercado.
- **Arquitetura MSC**: Separação clara de responsabilidades, facilitando a manutenção e testes unitários.
- **Segurança de Ponta**: Uso de `bcrypt` para hashing de senhas, autenticação via `JWT` e tratamento centralizado de erros com a classe customizada `AppError`.
- **Validação de Dados**: Implementação rigorosa de esquemas com `Zod` para garantir a integridade dos dados antes de atingirem o banco.

## 🛠️ Tecnologias Utilizadas

| Camada    | Tecnologia               |
| --------- | ------------------------ |
| Runtime   | Node.js + Express        |
| Banco     | PostgreSQL (Driver `pg`) |
| Segurança | Bcrypt + JWT             |
| Validação | Zod                      |
| Infra     | Docker & Docker Compose  |
| Variáveis | Dotenv                   |

## ⚙️ Funcionalidades Atuais

- `POST /users`: Cadastro de usuários com validação de esquema.
- `POST /auth/login`: Autenticação e geração de token JWT.
- `GET /users`: Listagem de usuários _(Rota Protegida / Paginação em progresso)_.
- `GET /users/:id`: Busca detalhada por ID _(Rota Protegida)_.
- `PATCH /users/:id`: Atualização parcial de dados _(Rota Protegida)_.
- `DELETE /users/:id`: Remoção de conta _(Rota Protegida)_.
- **Segurança**: Garantia de e-mails/usernames únicos e proteção de senhas.
- **Erros**: Sistema de feedback padronizado para o cliente (400, 401, 404, 409, 500).

## 🚀 Como Executar

**Pré-requisitos:** Node.js, Docker (opcional, mas recomendado) ou PostgreSQL local.

```bash
# Clonar o repositório
git clone https://github.com/seu-usuario/community_library.git

# Entrar na pasta
cd community_library

# Instalar dependências
npm install
```

Create a `.env` file in the root:

```env
DB_USER=your_user
DB_HOST=localhost
DB_DATABASE=community_library
DB_PASSWORD=your_password
DB_PORT=5432
JWT_SECRET=your_long_random_secret_here
```

**Option A — Docker (recommended):**

```bash
docker-compose up -d
npm run dev
```

**Option B — Local PostgreSQL:**
Create a `community_library` database, configure `.env`, then `npm run dev`.

Server runs at `http://localhost:3000`.

## 🔜 Roadmap

See `NEXT_STEPS.md` — includes ORM integration and automated testing.
