# Dependency Map

This document explains why each major dependency exists in the AI Travel Planner codebase. Sprint 0 installs the foundation packages only; feature-specific use will be introduced in later sprints.

## Core

| Package | Why |
|---|---|
| `next` | App Router, Server Components, Server Actions, deployment on Vercel |
| `react` | UI runtime |
| `react-dom` | Browser rendering |
| `typescript` | End-to-end type safety |

## AI

| Package | Why |
|---|---|
| `openai` | Official OpenAI SDK for server-side model calls |
| `ai` | Vercel AI SDK for streaming, provider abstraction, and AI workflow ergonomics |

## Supabase

| Package | Why |
|---|---|
| `@supabase/supabase-js` | Supabase client for database, auth, and storage |
| `@supabase/ssr` | Server/client auth helpers for Next.js App Router |

## UI

| Package | Why |
|---|---|
| `class-variance-authority` | Type-safe component variants, used by shadcn/ui patterns |
| `clsx` | Conditional class composition |
| `tailwind-merge` | Safe Tailwind class merging |
| `lucide-react` | Icon system |
| `next-themes` | Light/dark/system theme support |
| `sonner` | Toast notifications |
| `tw-animate-css` | Tailwind-compatible animation utilities for modern shadcn/ui setup |

## State

| Package | Why |
|---|---|
| `@tanstack/react-query` | Server state, mutations, cache invalidation |
| `zustand` | Lightweight UI-only client state |

## Validation and Forms

| Package | Why |
|---|---|
| `zod` | Runtime validation for forms, API inputs, and AI structured outputs |
| `react-hook-form` | Performant form state management |
| `@hookform/resolvers` | Zod integration for React Hook Form |

## Animation

| Package | Why |
|---|---|
| `framer-motion` | Motion primitives for state transitions and AI progress feedback |

## Development

| Package | Why |
|---|---|
| `eslint` | Static code analysis |
| `eslint-config-next` | Next.js lint rules |
| `eslint-config-prettier` | Prevent ESLint and Prettier formatting conflicts |
| `prettier` | Code formatting |
| `prettier-plugin-tailwindcss` | Tailwind class sorting |
| `husky` | Git hook management |
| `lint-staged` | Run checks only on staged files |
| `@commitlint/cli` | Commit message validation |
| `@commitlint/config-conventional` | Conventional commit rules |

## Testing

| Package | Why |
|---|---|
| `vitest` | Unit and integration test runner |
| `@testing-library/react` | React component testing |
| `@testing-library/jest-dom` | DOM assertion helpers |
| `jsdom` | Browser-like test environment |
| `playwright` | End-to-end testing |

## Dependency Principles

- Keep AI calls server-side.
- Use Zod at module boundaries.
- Use React Query for server state, not Zustand.
- Use Zustand only for temporary UI state.
- Keep UI primitive dependencies small and composable.
- Do not introduce provider-specific logic outside `services/`.
