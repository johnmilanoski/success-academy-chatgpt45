# AGENTS Instructions – Success Academy Platform

This repo contains a Next.js 15 (React 19 + TypeScript) application for an online
course platform.  Tests use Jest and ts-node. PostgreSQL is the database.

## Workflow
1. Install dependencies with `npm install`.
2. Run `npm test` to execute Jest tests.
3. Optional integration tests: `npm run test:fetch` (requires the app server).
4. Ensure all tests pass before committing changes.

## Conventions
- Use Node.js v18.
- Keep all code in TypeScript; new pages and API routes go under `app/app`.
- Database schema lives in `database/schema.sql`.
- Uploaded lesson media is stored under `uploads/` (git‑ignored).
- Do not commit `.env*` files or build artifacts.
- Use meaningful commit messages.

## Pull Request Notes
Provide a concise summary of your changes and include test results.
