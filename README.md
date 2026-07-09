# AI Travel Planner

AI Travel Planner is an AI-native travel planning product that helps first-time independent travelers create executable, editable, and budget-aware trip plans.

The product goal is not to generate generic travel guides. The goal is to help users make travel decisions: where to go, when to go, how to sequence the day, how much it may cost, and how to modify the plan when preferences change.

## Tech Stack

| Area          | Stack                                            |
| ------------- | ------------------------------------------------ |
| Framework     | Next.js 15 App Router                            |
| UI Runtime    | React 19                                         |
| Language      | TypeScript                                       |
| Styling       | Tailwind CSS, CSS variables, shadcn/ui patterns  |
| UI Primitives | Radix UI, Vaul, Lucide React                     |
| Forms         | React Hook Form                                  |
| Validation    | Zod                                              |
| State         | React Query, Zustand                             |
| AI            | OpenAI SDK, Vercel AI SDK                        |
| Backend/Data  | Supabase                                         |
| Deployment    | Vercel                                           |
| Tooling       | ESLint, Prettier, Husky, lint-staged, Commitlint |
| Testing       | Vitest, Testing Library, Playwright              |

## Project Structure

```text
app/          Next.js routes, layouts, system states
components/   Shared UI primitives and feedback/layout components
features/     Product feature modules
actions/      Server Actions
agents/       AI agent boundaries
workflows/    Multi-agent workflow orchestration
prompts/      Prompt registry, templates, versions
schemas/      Zod schemas and structured AI outputs
services/     External service adapters
lib/          Shared utilities, env, auth, errors
store/        Zustand UI state
supabase/     Migrations, policies, seed data
tests/        Unit, integration, E2E tests
docs/         Product and engineering documentation
```

See [Project Structure](./docs/project-structure.md) for directory responsibilities.

## Getting Started

Install dependencies:

```bash
pnpm install
```

Copy environment variables:

```bash
cp .env.example .env.local
```

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available Scripts

| Script              | Purpose                        |
| ------------------- | ------------------------------ |
| `pnpm dev`          | Start local development server |
| `pnpm build`        | Production build               |
| `pnpm start`        | Start production server        |
| `pnpm lint`         | Run ESLint                     |
| `pnpm lint:fix`     | Run ESLint with auto-fix       |
| `pnpm typecheck`    | Run TypeScript checks          |
| `pnpm format`       | Format files                   |
| `pnpm format:check` | Check formatting               |
| `pnpm test`         | Run unit/integration tests     |
| `pnpm test:watch`   | Run tests in watch mode        |
| `pnpm e2e`          | Run Playwright tests           |

## Environment Variables

See `.env.example`.

Core variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_MAPBOX_TOKEN`
- `MAPBOX_SECRET_KEY`

## Development Workflow

Before committing, Husky runs:

- `lint-staged`
- `commitlint`

Recommended manual checks:

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm build
```

## Documentation

| Document               | Link                                                                                                   |
| ---------------------- | ------------------------------------------------------------------------------------------------------ |
| User Research          | [docs/ai-travel-planner-user-research.md](./docs/ai-travel-planner-user-research.md)                   |
| PRD                    | [docs/ai-travel-planner-prd.md](./docs/ai-travel-planner-prd.md)                                       |
| IA + AI UX             | [docs/ai-travel-planner-ia-ai-ux.md](./docs/ai-travel-planner-ia-ai-ux.md)                             |
| AI Workflow            | [docs/ai-travel-planner-ai-workflow.md](./docs/ai-travel-planner-ai-workflow.md)                       |
| Technical Architecture | [docs/ai-travel-planner-technical-architecture.md](./docs/ai-travel-planner-technical-architecture.md) |
| Project Structure      | [docs/project-structure.md](./docs/project-structure.md)                                               |
| Dependencies           | [docs/dependencies.md](./docs/dependencies.md)                                                         |
| Design Tokens          | [docs/design-tokens.md](./docs/design-tokens.md)                                                       |
| Git Strategy           | [docs/git-strategy.md](./docs/git-strategy.md)                                                         |
| Sprint Backlog         | [docs/sprint-backlog.md](./docs/sprint-backlog.md)                                                     |
| Persistence            | [docs/persistence-architecture.md](./docs/persistence-architecture.md)                                 |

## Roadmap

- Sprint 0: Project foundation
- Sprint 1: Planner input and typed schemas
- Sprint 2: AI generation workflow
- Sprint 3: Trip detail and timeline
- Sprint 4: Modify flow and budget optimization
- Sprint 5: Persistent workspace, Supabase Auth, My Trips, and version history
