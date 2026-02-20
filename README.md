# URL Shortener

## Tech Stack

```
url-shortener/
├── applications/web/    # React + React Router v7
└── libs/engine/         # Domain logic
```

| Technology                                    | Description                                                                                       |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| [pnpm](https://pnpm.io/)                      | Fast, disk-efficient package manager with built-in monorepo support via workspaces                |
| [Turbo](https://turbo.build/)                 | High-performance build system for monorepos. Runs tasks in parallel and caches results            |
| [React](https://react.dev/)                   | Library for building user interfaces with components                                              |
| [React Router v7](https://reactrouter.com/)   | Full-stack React framework. Handles routing, data loading (loaders), mutations (actions), and SSR |
| [TypeScript](https://www.typescriptlang.org/) | Typed superset of JavaScript for catching errors at compile time                                  |
| [Tailwind CSS](https://tailwindcss.com/)      | Utility-first CSS framework for rapid UI development                                              |
| [Vite](https://vite.dev/)                     | Fast build tool and dev server with hot module replacement                                        |

## Local Setup

```bash
pnpm install
cp .env.example .env
```

For the web app (shortener + Prisma), set `DATABASE_URL` in `.env` or in `applications/web/.env`. Example (requires a running Postgres):

```bash
# Optional: start Postgres only (e.g. for local dev)
docker-compose up postgres -d

# Then in .env or applications/web/.env:
# DATABASE_URL=postgresql://urlshortener:urlshortener@localhost:5432/urlshortener
```

Apply Prisma migrations (from repo root or from `applications/web`):

```bash
cd applications/web && pnpm exec prisma migrate dev
```

Then start the app:

```bash
pnpm dev
```

Open `http://localhost:5173`

## Docker Setup

```bash
docker-compose up --build
```

This starts **Postgres** and the **web** app. The web service uses `DATABASE_URL=postgresql://urlshortener:urlshortener@postgres:5432/urlshortener` automatically.

**Migrations:** Run them before or after the first start. Options:

- **One-off in Docker:**  
  `docker-compose run --rm web pnpm exec prisma migrate deploy`
- **Or** run migrations locally against the same Postgres (e.g. with `DATABASE_URL` pointing to `localhost:5432` while `docker-compose up postgres -d`).

Open `http://localhost:3000`
