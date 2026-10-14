# Tic Tac Toe

Local two-player Tic Tac Toe. React + TypeScript + Vite. Built as a test of coding agents on OpenRouter free models.

> Status: game logic and state hook are done and tested; the board UI is still a placeholder.

## Commands

| Command | What it does |
|---|---|
| `npm ci` | Install dependencies |
| `npm run dev` | Dev server at http://localhost:5173 |
| `npm run test:run` | Run unit tests once |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript, no emit |
| `npm run build` | Typecheck + production build to `dist/` |

## Branches

- `main` — released code. Changes arrive via PR from `development`.
- `development` — integration branch. Feature branches PR into it.

Both are protected: PR required, CI and security checks must pass.

Docs: spec in `docs/superpowers/specs/`, plan in `docs/superpowers/plans/`.
