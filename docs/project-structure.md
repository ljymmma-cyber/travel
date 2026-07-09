# Project Structure

This project is organized for an AI-native, server-first Next.js product. The goal is to keep product UI, AI workflows, typed schemas, services, and infrastructure clearly separated so the codebase can scale beyond the MVP.

```text
app/
components/
features/
lib/
hooks/
actions/
prompts/
agents/
workflows/
schemas/
types/
services/
store/
config/
constants/
styles/
public/
tests/
supabase/
docs/
```

## Directory Responsibilities

| Directory | Responsibility | Notes |
|---|---|---|
| `app/` | Next.js App Router routes, layouts, loading, error, and not-found boundaries | Server Components by default |
| `components/ui/` | shadcn/ui primitives and reusable low-level UI | No business logic |
| `components/layout/` | App shell, navigation, layout primitives | Shared layout only |
| `components/feedback/` | Empty, error, loading, skeleton, toast-related components | Reusable system states |
| `components/shared/` | Cross-feature reusable components | Keep generic and portable |
| `features/planner/` | Trip requirement input and planner-specific UI | Sprint 1 target |
| `features/trip/` | Trip overview and trip detail feature composition | Owns trip-level UI |
| `features/timeline/` | Day timeline and activity presentation | Activity editing later |
| `features/budget/` | Budget views and budget optimization UI | AI-backed in later sprint |
| `features/map/` | Map preview, route display, map interactions | Mapbox/Google Maps adapter through services |
| `features/history/` | Saved trips, drafts, delete/restore flows | Reads server state |
| `features/profile/` | User profile and travel preferences | Supabase-backed later |
| `features/ai/` | AI panel and AI status surfaces | UI layer only; no prompt logic |
| `actions/` | Server Actions for mutations and server-side workflows | Validate input with Zod |
| `agents/` | Single-purpose AI agents | Planner, budget, map, weather, restaurant, modifier, explain |
| `workflows/` | Multi-agent orchestration | Generate, modify, budget optimize, weather replan |
| `prompts/templates/` | Prompt templates | No hardcoded prompts inside components |
| `prompts/versions/` | Prompt version snapshots | Enables evaluation and rollback |
| `schemas/` | Zod schemas for inputs, AI outputs, APIs, and domain models | Source of runtime truth |
| `schemas/ai/` | AI-specific structured output schemas | Used by agents and validators |
| `services/openai/` | OpenAI SDK and Vercel AI SDK integration | Server-only |
| `services/supabase/` | Supabase browser/server clients and auth helpers | Server/client split required |
| `services/mapbox/` | Map service adapter | Keep provider replaceable |
| `services/weather/` | Weather provider adapter | Future tool layer |
| `services/analytics/` | Product analytics events | PostHog/Vercel Analytics later |
| `services/logging/` | App and AI workflow logging | Avoid console scattering |
| `services/rate-limit/` | Rate limiting helpers | Protect AI endpoints |
| `hooks/` | Shared React hooks | No prompt or DB ownership |
| `store/` | Zustand stores for UI-only state | Never source of truth for server data |
| `lib/auth/` | Auth helpers and ownership utilities | Works with Supabase |
| `lib/env/` | Environment variable validation | Fail fast in production |
| `lib/errors/` | Typed error helpers | Unified error shape |
| `lib/result/` | Result helpers for actions/services | Predictable success/failure handling |
| `lib/dates/` | Date utilities | Timezone-safe helpers later |
| `lib/currency/` | Currency formatting and budget helpers | Budget feature dependency |
| `lib/ids/` | ID generation helpers | Stable IDs for plan/activity objects |
| `config/` | App, route, AI, analytics, and provider configuration | Centralized non-secret config |
| `constants/` | Static constants and enums | Shared between modules |
| `styles/` | Global style layers and design token files | No page-specific styles |
| `tests/unit/` | Unit tests | Schemas, utils, agents |
| `tests/integration/` | Integration tests | Actions, services, workflows |
| `tests/e2e/` | End-to-end tests | User flows with Playwright |
| `supabase/migrations/` | Database migrations | Source controlled |
| `supabase/policies/` | RLS policies | Security reviewable |
| `supabase/seed/` | Local development seed data | No production secrets |
| `docs/` | Product, UX, AI workflow, and architecture docs | Portfolio and team reference |

## Architecture Rules

- UI components do not call OpenAI directly.
- Prompt logic lives under `prompts/`, `agents/`, and `workflows/`.
- Runtime validation lives in `schemas/`.
- Server mutations live in `actions/`.
- External providers are wrapped in `services/`.
- Zustand is only for temporary UI state.
- React Query owns server cache on the client.
- Supabase is the source of truth for persisted product data.
