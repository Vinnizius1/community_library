# 📚 Community Library API

A RESTful API for community library management — built with Node.js, 
Express, and PostgreSQL.

## 💡 About This Project

Started as a guided course project using SQLite. I challenged myself 
to go further: migrated to PostgreSQL, rebuilt the architecture using 
the MSC pattern (Model/Repository – Service – Controller), and added 
production-grade security features.

**Key decisions:**
- **SQLite → PostgreSQL** — for scalability and real-world relevance
- **MSC Architecture** — clean separation of concerns, built to scale
- **Security** — bcrypt password hashing + centralized error handling 
  (`AppError`)

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js + Express |
| Database | PostgreSQL (`pg` driver) |
| Security | Bcrypt |
| DevOps | Docker Compose |
| Config | Dotenv |

## ⚙️ Current Features

- `POST /users` — Account creation with input validation
- Unique email enforcement
- Password hashing on registration
- Unified error handling via custom `AppError` class

## 🚀 Getting Started

**Prerequisites:** Node.js, PostgreSQL (local or via Docker)
```bash
git clone <repo-url>
cd community_library
npm install
```

Create a `.env` file in the root:
```env
DB_USER=your_user
DB_HOST=localhost
DB_DATABASE=community_library
DB_PASSWORD=your_password
DB_PORT=5432
```

**Option A — Docker (recommended):**
```bash
docker-compose up -d
npm start
```

**Option B — Local PostgreSQL:**
Create a `community_library` database, configure `.env`, then 
`npm start`.

Server runs at `http://localhost:3000`.

## 🔜 Roadmap

See `NEXT_STEPS.md` — includes JWT auth, ORM integration, and 
automated testing.
