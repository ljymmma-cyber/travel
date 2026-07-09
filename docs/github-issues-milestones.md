# GitHub Issues and Milestones

This document provides portfolio-ready GitHub issue and milestone planning. It can be copied into GitHub Issues or used as a roadmap artifact during interviews.

## Issue Labels

| Label | Meaning |
| --- | --- |
| `bug` | Product or technical defect |
| `feature` | New user-facing capability |
| `enhancement` | Improvement to existing feature |
| `tech-debt` | Maintainability or architecture work |
| `ai-quality` | AI output quality, validation, prompt, evaluation |
| `ux` | Interaction, accessibility, or usability improvement |
| `analytics` | Tracking, dashboard, product validation |
| `roadmap` | Future product direction |

## GitHub Issues

| # | Title | Type | Priority | Description | Acceptance Criteria |
| --- | --- | --- | --- | --- | --- |
| 1 | Add real map routing validation | Feature | P0 | Validate activity sequence using map distance and travel time. | Timeline shows route warnings when travel time is unreasonable. |
| 2 | Integrate opening hours check | Feature | P0 | Prevent AI from scheduling closed attractions. | Activity includes opening-hours status and conflict warning. |
| 3 | Add weather-aware replanning | Feature | P0 | Replan outdoor-heavy days when weather is poor. | Rain Plan modifies only affected day and explains reason. |
| 4 | Track Planner funnel events | Analytics | P0 | Add analytics from Planner view to Timeline view. | Events captured for input, validation, generate, success, failure. |
| 5 | Track Partial Replanning quality | Analytics | P0 | Measure patch acceptance, undo, redo, and diff views. | Dashboard can calculate modification success rate. |
| 6 | Improve AI schema repair logging | Tech Debt | P1 | Make invalid JSON repair attempts easier to diagnose. | Logs include field, error type, retry count, repair result. |
| 7 | Add export to PDF | Feature | P1 | Users can export itinerary for offline use. | Export contains overview, daily timeline, budget, notes. |
| 8 | Add shareable trip link | Feature | P1 | Users can share itinerary with friends. | Public/private share setting exists and link opens read-only trip. |
| 9 | Add collaborative trip comments | Feature | P2 | Travel companions can comment on activities. | Comments attach to day/activity and sync across users. |
| 10 | Improve mobile timeline density | UX | P1 | Timeline should remain readable on small screens. | No overflow; key actions remain reachable. |
| 11 | Add trip template library | Enhancement | P2 | Provide popular templates for Tokyo, Paris, Seoul, Bangkok. | Template can prefill Planner fields. |
| 12 | Add destination-specific smart defaults | Enhancement | P1 | Suggest budget, pace, transport defaults by destination. | Planner suggestions change by destination. |
| 13 | Add AI confidence indicator | AI Quality | P1 | Show confidence level for recommendations and constraints. | Activities include confidence and uncertainty reason. |
| 14 | Add source/reference support | AI Quality | P1 | Increase trust with external references for places. | Place card can display source or verification status. |
| 15 | Add hallucination reporting | Bug | P1 | Users can flag incorrect or fake place info. | Feedback event includes activity and error category. |
| 16 | Add anonymous draft save | Feature | P1 | Let users save locally before login. | Anonymous user can restore draft after refresh. |
| 17 | Reduce AI cost per generation | Tech Debt | P1 | Optimize prompt size and model routing. | Average cost per successful plan decreases. |
| 18 | Add AI evaluation test set | AI Quality | P0 | Create regression cases for route, budget, interest, constraints. | CI can run deterministic schema and scoring checks. |
| 19 | Improve error recovery for AI timeout | Bug | P0 | Timeout should not lose user input. | User sees retry option and form state remains intact. |
| 20 | Add budget category editing | Enhancement | P2 | Users can change budget allocation after generation. | Budget changes trigger scoped replan. |
| 21 | Add itinerary comparison view | Feature | P2 | Compare two versions side by side. | Version diff shows day/activity/budget changes. |
| 22 | Add calendar export | Feature | P2 | Export activities to Google/Apple Calendar. | ICS export includes activity time and location. |
| 23 | Improve accessibility of Modify Panel | UX | P0 | Ensure keyboard and screen reader support. | Panel passes keyboard navigation and ARIA checks. |
| 24 | Add onboarding checklist | Enhancement | P2 | Help first-time users understand workflow. | Onboarding does not block Generate and can be dismissed. |
| 25 | Add rate limit and quota UI | Feature | P1 | Show usage limits clearly. | Quota exceeded state explains next action. |

## Milestones

### Sprint 0: Project Foundation

**Goal:** Establish production-ready development foundation.

Issues:

- Set up Next.js 15, React 19, TypeScript, Tailwind, shadcn/ui.
- Configure ESLint, Prettier, Husky, Commitlint.
- Set up Supabase and OpenAI client foundations.
- Create docs and sprint backlog.

**Definition of Done**

- App builds.
- Lint/typecheck/test scripts exist.
- Project structure is documented.

### Sprint 1: Planner Page

**Goal:** Build guided input for high-quality AI planning.

Issues:

- Planner form.
- Smart suggestions.
- AI tips.
- Validation and AI Thinking state.

**Definition of Done**

- User can enter complete trip requirements.
- Validation prevents low-quality generation attempts.

### Sprint 2: AI Planning Engine

**Goal:** Build structured AI planning workflow.

Issues:

- Requirement parser.
- Prompt template system.
- JSON Schema validation.
- Repair strategy.
- Logging.

**Definition of Done**

- AI output conforms to TravelPlan schema.
- Failures have retry and repair paths.

### Sprint 3: Timeline Experience

**Goal:** Convert AI output into executable itinerary.

Issues:

- Trip overview.
- Day timeline.
- Activity cards.
- Budget card.
- Explain interaction.

**Definition of Done**

- Mock TravelPlan renders as usable trip timeline.

### Sprint 4: Partial Replanning

**Goal:** Enable human-in-the-loop AI modification.

Issues:

- Modify panel.
- JSON Patch strategy.
- Diff highlight.
- Lock/favorite.
- Undo/redo/history.

**Definition of Done**

- AI can modify targeted scope without changing unrelated days.

### Sprint 5: Workspace and Persistence

**Goal:** Make the product reusable across sessions.

Issues:

- Supabase Auth.
- My Trips.
- Trip detail.
- Version history.
- Auto-save.

**Definition of Done**

- User can save, reopen, and continue editing trips.

### V1: Trust and Executability

**Goal:** Make the itinerary more reliable for real trips.

Planned issues:

- Real map routing validation.
- Opening hours check.
- Weather-aware replanning.
- Export PDF.
- Product analytics dashboard.

### V2: Collaboration and Growth

**Goal:** Support real group travel behavior.

Planned issues:

- Share link.
- Collaborative comments.
- Preference voting.
- Template gallery.
- Invite flow.

### V3: Travel Execution Agent

**Goal:** Move from planning to execution.

Planned issues:

- Calendar export.
- Booking handoff.
- Flight/hotel context.
- MCP/tool calling.
- Real-time replanning during travel.
