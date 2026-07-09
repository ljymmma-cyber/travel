# Git Strategy

## Branch Strategy

| Branch | Purpose |
|---|---|
| `main` | Stable branch. Every commit should build. |
| `feature/*` | Feature work during future sprints. |
| `fix/*` | Bug fixes. |
| `docs/*` | Documentation updates. |
| `chore/*` | Tooling, dependency, and maintenance work. |

Sprint 0 is being committed directly to `main` because it is a solo foundation setup and each task is independently verified before push.

## Commit Convention

Use Conventional Commits:

```text
type(scope): summary
```

| Type | Use |
|---|---|
| `feat` | New product or platform capability |
| `fix` | Bug fix |
| `refactor` | Internal restructuring without behavior change |
| `docs` | Documentation |
| `style` | Formatting or non-functional styling changes |
| `test` | Tests |
| `ci` | CI/CD changes |
| `chore` | Maintenance and tooling |
| `build` | Build system or dependency changes |
| `perf` | Performance improvement |

## Sprint Commit Style

Prefer one coherent commit per foundation task:

```text
chore(project): initialize next app foundation
chore(project): add scalable directory structure
chore(deps): install project foundation dependencies
chore(config): add production project tooling
feat(theme): add design tokens
feat(app): add root providers and system states
feat(ui): add base ui primitives
feat(infra): add supabase and openai foundations
docs(readme): add project readme and sprint backlog
```

## Pull Request Checklist

- `pnpm format:check` passes.
- `pnpm lint` passes.
- `pnpm typecheck` passes.
- `pnpm build` passes.
- New Server Actions validate inputs with Zod.
- New AI outputs have structured schemas.
- No secrets or `.env` files are committed.
