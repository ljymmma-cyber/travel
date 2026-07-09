# Design Tokens

This document defines the system-level design tokens for AI Travel Planner. Tokens are intentionally product-neutral at Sprint 0: they support a consistent, accessible interface without defining final visual style or page-specific design.

Source of truth:

- CSS variables: `styles/tokens.css`
- Tailwind theme mapping: `app/globals.css`

## Token Categories

| Category | Token Prefix | Purpose |
|---|---|---|
| Color | `--background`, `--primary`, `--muted`, etc. | Semantic UI colors |
| Feedback Color | `--success`, `--warning`, `--info`, `--destructive` | System states |
| Chart Color | `--chart-*` | Future budget and analytics visualization |
| Spacing | `--space-*` | Layout rhythm |
| Radius | `--radius-*` | Border radius scale |
| Typography | `--font-size-*`, `--line-height-*`, `--font-weight-*` | Text hierarchy |
| Shadow | `--shadow-*` | Elevation system |
| Motion | `--duration-*`, `--ease-*` | Interaction timing |

## Color Strategy

Colors are semantic rather than component-specific.

| Token | Use |
|---|---|
| `--background` | Page background |
| `--foreground` | Primary text |
| `--card` | Card/surface background |
| `--popover` | Floating surfaces |
| `--primary` | Primary actions and focus moments |
| `--secondary` | Secondary actions and neutral controls |
| `--muted` | Subtle backgrounds |
| `--accent` | Non-critical highlights |
| `--destructive` | Destructive actions and errors |
| `--border` | Borders and separators |
| `--input` | Input borders/background support |
| `--ring` | Focus rings |

## Dark Mode

Dark mode is class-based through `.dark`, compatible with `next-themes`.

Rules:

- Do not use `prefers-color-scheme` directly in component styles.
- Use semantic tokens instead of hard-coded colors.
- Future theme switching should toggle the `.dark` class at the document level.

## Spacing Scale

| Token | Value |
|---|---:|
| `--space-1` | `0.25rem` |
| `--space-2` | `0.5rem` |
| `--space-3` | `0.75rem` |
| `--space-4` | `1rem` |
| `--space-6` | `1.5rem` |
| `--space-8` | `2rem` |
| `--space-12` | `3rem` |
| `--space-16` | `4rem` |
| `--space-24` | `6rem` |

## Radius Scale

Cards and controls should generally stay at `--radius-md` or `--radius-lg`. Avoid large pill-like shapes unless the component is naturally a pill control, such as tags or segmented chips.

| Token | Value |
|---|---:|
| `--radius-xs` | `0.25rem` |
| `--radius-sm` | `0.375rem` |
| `--radius-md` | `0.5rem` |
| `--radius-lg` | `0.75rem` |
| `--radius-xl` | `1rem` |
| `--radius-full` | `9999px` |

## Typography

Typography tokens define scale only. Final page hierarchy will be designed later through components and layouts.

Rules:

- Do not scale font size with viewport width.
- Use semantic text components later rather than one-off font sizes.
- Keep letter spacing at default unless a specific component requires otherwise.

## Motion

| Token | Use |
|---|---|
| `--duration-fast` | Hover/focus feedback |
| `--duration-normal` | Small UI transitions |
| `--duration-slow` | Panel/dialog transitions |
| `--ease-standard` | Default easing |
| `--ease-emphasized` | Important state change easing |

Rules:

- Motion should clarify state changes.
- Long AI operations should use progress/status patterns rather than decorative animation.
- Respect future reduced-motion settings when implementing animated components.

## Implementation Rules

- Components should use Tailwind semantic utilities mapped from these variables.
- Do not hard-code colors in feature components.
- New tokens must be added to `styles/tokens.css` first.
- If a token needs Tailwind utility access, map it in `app/globals.css`.
- Feature-specific values should not become global tokens until reused.
