# Project Instructions for Claude Code

This is a Next.js (App Router) project. Follow these conventions strictly to keep the codebase clean, consistent, and maintainable.

## Stack & Router

- Use the **App Router** (`app/`), not the Pages Router. Do not create `pages/` unless explicitly told to.
- Language: TypeScript everywhere. No `.js`/`.jsx` files.
- Put all source code under `src/` (i.e. `src/app`, `src/components`, `src/lib`, etc.) rather than at the project root — keeps config files separated from app code.

## Folder Structure

```
src/
  app/            # routes only: page.tsx, layout.tsx, loading.tsx, error.tsx, route.ts
  components/
    ui/           # generic, reusable, presentational components (buttons, inputs, cards)
    layout/       # header, footer, sidebar, nav
    features/     # feature-specific components, grouped by domain (auth/, billing/, dashboard/)
  lib/
    actions/      # server actions
    data/         # data-fetching / query functions
    validators/    # zod/yup schemas
    utils.ts      # small generic helpers only — do not let this become a dumping ground
  hooks/          # custom React hooks
  types/          # shared TypeScript types/interfaces
  config/         # env access, site config, feature flags
public/           # static assets
```

- Co-locate route-specific components/utilities inside the relevant `app/` route folder using a leading underscore (e.g. `app/dashboard/_components/`) when they're not reused elsewhere. Reusable stuff goes in `src/components`.
- Never let `components/` become one flat folder of 100+ files — always subdivide by `ui/`, `layout/`, `features/<domain>/`.
- Never let a single `utils.ts` grow unbounded — split by concern (`date.ts`, `format.ts`, `validation.ts`).

## Server vs Client Components

- Default to **Server Components**. Only add `"use client"` when the component actually needs interactivity, state, effects, or browser-only APIs.
- Push `"use client"` as far down the tree as possible — wrap only the small interactive leaf, not the whole page/layout.
- Never fetch data in a Client Component if it can be fetched in a Server Component and passed down as props.
- Do not import server-only code (DB clients, secrets, `fs`, etc.) into a file that could end up in a Client Component's bundle.

## Data Fetching & Mutations

- Fetch data directly in Server Components with `async`/`await`; don't wrap plain reads in an API route unless something external actually needs that route.
- Use **Server Actions** (`"use server"`, in `lib/actions/`) for mutations from forms instead of manual API route + fetch when possible.
- Only create `app/api/**/route.ts` handlers for things that genuinely need a public HTTP endpoint (webhooks, third-party integrations, non-Next consumers).
- Use `fetch` caching options (`cache`, `next: { revalidate }`) intentionally — don't leave defaults unexamined for data that changes frequently or rarely.

## Rendering & Performance

- Use `next/image` for all images, `next/font` for fonts — never raw `<img>` tags or manual `<link>` font imports.
- Use `loading.tsx` and `<Suspense>` boundaries for slow data fetches instead of client-side spinners where possible.
- Use dynamic imports (`next/dynamic`) for large client-only components not needed on initial paint.
- Avoid unnecessary `"use client"` at the top of large files — it forces everything below it into the client bundle.

## State Management

- Prefer server state (fetched data, URL search params via `useSearchParams`) over client state.
- For genuine client-side global state, use a lightweight store (e.g. Zustand) — avoid Redux unless the app has complex, deeply nested client state needs.
- Keep state as local as possible; lift only when actually shared.

## Types & Validation

- Centralize shared types in `src/types/`; keep component-local types next to the component.
- Validate all external input (form submissions, API payloads, env vars) with a schema library (e.g. Zod) — don't trust `any`.
- No `any` unless justified with a comment explaining why.

## Environment Variables

- All env vars accessed through a single typed config module (`src/config/env.ts`), not scattered `process.env.X` calls.
- Anything exposed to the browser must be prefixed `NEXT_PUBLIC_` and should be treated as public — never put secrets there.

## Styling

- Follow whatever styling system is already set up in the repo (Tailwind, CSS Modules, etc.) — don't introduce a second styling approach.
- Global styles/resets/CSS variables live in `app/globals.css` only.

## Code Quality

- Run and respect existing ESLint/Prettier config; don't disable rules to make code pass — fix the underlying issue.
- Keep components small and single-purpose; if a component file exceeds ~200 lines, consider splitting it.
- Avoid deep nesting of folders (more than 3–4 levels under `src/` is a smell — flatten by feature instead).
- Write meaningful names for files, components, and functions — no `utils2.ts`, `NewComponent.tsx`, `temp.ts`.

## Before Finishing Any Task

- Check whether a new component/page should be a Server or Client Component — don't default to `"use client"` out of habit.
- Check whether new logic belongs in `lib/` rather than inline in a component.
- Run the project's lint/typecheck/build commands if available and fix any errors introduced.
- Don't leave commented-out code or console.logs in committed code.

## References

- App Router structure conventions: https://nextjs.org/docs/app/getting-started/project-structure
- Server & Client Components: https://nextjs.org/docs/app/building-your-application/rendering/server-components
- Data fetching: https://nextjs.org/docs/app/building-your-application/data-fetching
- Server Actions: https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations
