# admin-antd

React 19 + Vite + TypeScript admin dashboard template built on [Bulletproof React](https://github.com/alan2207/bulletproof-react) architecture with Ant Design Pro Components.

## Tech Stack

- **Framework**: React 19 + React Router 7 + TypeScript 5
- **Build**: Vite 7 + SWC
- **UI**: Ant Design 6 + Pro Components + Tailwind CSS + lucide-react
- **State**: React Query 5 (server state) + Zustand 5 (global state)
- **Validation**: Zod (schema-first)
- **API**: openapi-fetch + openapi-react-query

## Getting Started

```bash
cp .env.example .env
pnpm install
pnpm dev        # http://localhost:8081
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server |
| `pnpm build` | Build for production |
| `pnpm lint` | Run ESLint |
| `pnpm check-types` | Run TypeScript type check |
| `pnpm api:gen` | Generate OpenAPI types (requires backend at localhost:3000) |

## Architecture

Unidirectional data flow: `shared → features → app`

```
src/
├── app/          # Routes, layouts, global providers
├── features/     # Feature modules organized by domain
├── components/   # Shared UI components
├── config/       # Env vars, theme, menu config
├── lib/          # API client, React Query setup
├── stores/       # Zustand global state
└── types/        # Global types (includes OpenAPI generated)
```

Each feature follows: `api/` + `components/` + `types/` + `index.ts`
