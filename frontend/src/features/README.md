# Feature folders

Each subdirectory here is a vertical slice of one product feature (auth, dashboard,
editor, ai-assistant, export, settings) — not a horizontal layer. Inside a feature folder
you'll typically find `components/`, `hooks/`, `api.ts` (TanStack Query hooks for that
feature's endpoints), and `types.ts`, all colocated.

Why feature folders instead of top-level `components/`, `hooks/`, `services/` folders:
when you're working on the AI Assistant, everything relevant lives in one place instead
of being scattered across three parallel folder trees. `src/components/ui/` is the one
exception — those are generic, feature-agnostic primitives (Button, Card) from shadcn/ui,
shared by every feature.

Populated starting in Phase 1 (Auth).
