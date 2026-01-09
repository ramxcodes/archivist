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
- **PostgreSQL** - Database engine
- **Authentication** - Better-Auth
- **Turborepo** - Optimized monorepo build system

## Installation & Setup

Follow these steps to get the project running on your local machine.

### Prerequisites

- [Bun](https://bun.sh/) (latest version)
- [PostgreSQL](https://www.postgresql.org/) database

### 1. Install Dependencies

Install the project dependencies using Bun:

```bash
bun install
```

### 2. Environment Configuration

#### Backend (Server)
1. Copy the example environment file:
   ```bash
   cp apps/server/.env.example apps/server/.env
   ```
2. Update `apps/server/.env` with your configuration:
   - `DATABASE_URL`: Connection string for your PostgreSQL database.
   - `BETTER_AUTH_SECRET`: A secure random string for authentication.
   - `BETTER_AUTH_URL`: `http://localhost:3003` (Frontend URL).
   - `CORS_ORIGIN`: `http://localhost:3003` (Frontend URL).
   - `GOOGLE_CLIENT_ID`: Google OAuth client ID.
   - `GOOGLE_CLIENT_SECRET`: Google OAuth client secret.

   > **Note:** You can get the `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` from the [Google Cloud Console](https://console.cloud.google.com/).
   >
   > **Google OAuth Configuration:**
   > - **Authorized JavaScript origins:** `http://localhost:3003`
   > - **Authorized redirect URIs:** `http://localhost:3009/api/auth/callback/google`
   >
   > For more details, see the [Better Auth Installation Guide](https://www.better-auth.com/docs/installation).


#### Frontend (Web)
1. Copy the example environment file:
   ```bash
   cp apps/web/.env.example apps/web/.env
   ```
2. Update `apps/web/.env`:
   - `NEXT_PUBLIC_SERVER_URL`: `http://localhost:3009` (Backend API URL).
   - `NEXT_PUBLIC_FRONTEND_URL`: `http://localhost:3003`.

### 3. Database Setup

Once your `.env` is configured and your Postgres database is running, push the schema:

```bash
bun run db:push
```

You can also open the database studio to view your tables:
```bash
bun run db:studio
```

### 4. Run the Application

Start both the frontend and backend in development mode:

```bash
bun run dev
```

- **Frontend**: [http://localhost:3003](http://localhost:3003)
- **Backend**: [http://localhost:3009](http://localhost:3009)

## Project Structure

```
archivist/
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
   cd archivist
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
