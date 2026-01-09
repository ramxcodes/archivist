## About Archivist

Archivist is a platform where you can make daily journal entries with custom categories.

**Design by:** [Satyam Vyas](https://x.com/satyamvyas04)  
**Frontend code by:** [Karan](https://x.com/karaan_dev)  
**Code assistance:** [Blackbox AI](https://x.com/blackboxai)

## Features

- **TypeScript** - For type safety and improved developer experience
- **Next.js** - Full-stack React framework
- **TailwindCSS** - Utility-first CSS for rapid UI development
- **shadcn/ui** - Reusable UI components
- **Express** - Fast, unopinionated web framework
- **Bun** - Runtime environment
- **Drizzle** - TypeScript-first ORM
- **Redis** - For caching and rate limiting
- **PostgreSQL** - Database engine
- **Authentication** - Better-Auth
- **Turborepo** - Optimized monorepo build system

## Getting Started

First, install the dependencies:

```bash
bun install
```

## Database Setup

This project uses PostgreSQL with Drizzle ORM.

1. Make sure you have a PostgreSQL database set up.
2. Update your `apps/server/.env` file with your PostgreSQL connection details.

3. Apply the schema to your database:

```bash
bun run db:push
```
### Redis Setup

This project requires Redis for rate limiting.

1. Start a Redis instance (using Docker is recommended):
   ```bash
   docker run -d -p 6379:6379 --name archivist-redis redis
   ```

Then, run the development server:

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the web application.
The API is running at [http://localhost:3001](http://localhost:3001).

## Project Structure

```
boilerplate/
├── apps/
│   ├── web/         # Frontend application (Next.js)
│   └── server/      # Backend API (Express)
├── packages/
│   ├── api/         # API layer / business logic
│   ├── auth/        # Authentication configuration & logic
│   └── db/          # Database schema & queries
```

## Available Scripts

- `bun run dev`: Start all applications in development mode
- `bun run build`: Build all applications
- `bun run dev:web`: Start only the web application
- `bun run dev:server`: Start only the server
- `bun run check-types`: Check TypeScript types across all apps
- `bun run db:push`: Push schema changes to database
- `bun run db:studio`: Open database studio UI

## Contribution Guide

We use a feature branch workflow for contributions. Please follow these steps:

### 1. Fork and Clone

1. Fork this repository to your GitHub account
2. Clone your fork locally:
   ```bash
   git clone https://github.com/ramxcodes/archivist.git
   cd boilerplate
   ```

### 2. Set Up Development Environment

1. Install dependencies:

   ```bash
   bun install
   ```

2. Set up your environment variables:

   ```bash
   cp apps/server/.env.example apps/server/.env
   ```

   Update the `.env` file with your database credentials.

3. Set up the database:
   ```bash
   bun run db:push
   ```

### 3. Create a Feature Branch

Create a new branch for your feature or bug fix:

```bash
git checkout -b feature/your-feature-name
```

### 4. Make Your Changes

- Keep changes scoped and incremental; smaller PRs are easier to review.
- If you touch the database schema, update the Drizzle schema and push it to your local database with `bun run db:push`.
- Verify type safety and builds before opening a PR:

```bash
bun run check-types
bun run build
```

### 5. Commit and Push

```bash
git add .
git commit -m "feat: add short description of change"
git push origin feature/your-feature-name
```

Use clear, descriptive commit messages. Group unrelated changes into separate commits or branches.

### 6. Open a Pull Request

1. Open a PR against the main repository.
2. Include a concise summary of the change, any notable decisions, and screenshots for UI updates.
3. List the checks you ran (e.g., `bun run check-types`, `bun run build`).

## Coding Guidelines

- Prefer TypeScript with strict typings; add interfaces/types near their usage.
- Reuse existing shadcn/ui components and Tailwind utilities for consistency.
- Keep API contracts in sync between `apps/server` and `apps/web`; update shared types in `packages/api` when needed.
- For database changes, keep Drizzle schema and migrations consistent and document any data backfill steps in the PR.
