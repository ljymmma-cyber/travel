# Sprint Backlog

## Sprint 0: Project Foundation

| Item | Status |
|---|---|
| Initialize Next.js 15 project | Done |
| Install foundation dependencies | Done |
| Add scalable directory structure | Done |
| Configure tooling | Done |
| Add design tokens | Done |
| Add root layout, providers, and system states | Done |
| Add base UI primitives | Done |
| Add Supabase foundation | Done |
| Add OpenAI foundation | Done |
| Add README and docs | Done |

## Sprint 1: Planner Input + Schemas

| Field | Detail |
|---|---|
| Goal | Build the trip requirement input foundation and typed domain schemas. |
| Estimated Effort | 3-5 days |
| Scope | Planner form shell, React Hook Form setup, Zod schemas for preferences/travel plan/activity, form validation states. |
| Completion Standard | Users can enter trip requirements locally and produce a validated Preference object. No AI generation required yet. |

## Sprint 2: AI Generate Workflow

| Field | Detail |
|---|---|
| Goal | Generate structured TravelPlan JSON through the AI workflow layer. |
| Estimated Effort | 5-7 days |
| Scope | Prompt registry v1, planner agent, structured output validation, retry/repair path, mock fallback, createTripPlan Server Action. |
| Completion Standard | A valid TravelPlan JSON can be generated, validated, and persisted as a draft. |

## Sprint 3: Trip Detail + Timeline

| Field | Detail |
|---|---|
| Goal | Render generated plans as editable trip workspace surfaces. |
| Estimated Effort | 5-7 days |
| Scope | Trip overview, day timeline, activity cards, history list, server state with React Query. |
| Completion Standard | Users can open a saved trip and inspect day/activity structure. |

## Sprint 4: Modify + Budget

| Field | Detail |
|---|---|
| Goal | Add local modification workflow and budget analysis. |
| Estimated Effort | 5-7 days |
| Scope | Trip Modifier Agent, PlanPatch schema, undo/version history, budget analysis, budget optimize action. |
| Completion Standard | Users can modify a day/activity without affecting unrelated days, and budget estimates can be viewed. |

## Sprint 5: Map + Export + Production Hardening

| Field | Detail |
|---|---|
| Goal | Complete MVP execution loop and harden for demo deployment. |
| Estimated Effort | 5-7 days |
| Scope | Map provider integration, share links, export text/PDF path, analytics events, rate limits, error monitoring. |
| Completion Standard | Users can generate, inspect, modify, save, share, and export a trip plan in a production-like environment. |
