# Pantry — Meal Planner (Next.js frontend)

Frontend for the `meal-planner-backend` GraphQL API. Built with **Next.js 16**,
**Zustand**, **TanStack Query**, and **Axios**.

## Setup

```bash
npm install
cp .env.local.example .env.local   # edit if your backend runs elsewhere
npm run dev
```

Make sure the backend is running first (`npm run dev` in the backend repo,
default `http://localhost:4000/graphql`), and that its Postgres database is
up (`docker-compose up -d` in the backend repo).

## Why GraphQL over Axios?

The backend is a **GraphQL** API (graphql-yoga), not REST — there's a single
`/graphql` endpoint that takes a `query`/`mutation` string + `variables` in
a POST body. Axios is still exactly the right tool here: it's just the HTTP
client. `lib/axios.ts` creates one configured instance, and
`lib/graphql/client.ts` (`gqlRequest`) is a tiny helper that POSTs a
GraphQL document through it and unwraps `{ data, errors }`. Every API call
in `lib/api/*.ts` is a one-liner on top of `gqlRequest`.

## How the auth flow works (the part you asked about)

1. **Zustand owns the auth state.** `store/authStore.ts` holds `token` and
   `user` in a Zustand store created with the `persist` middleware, which
   mirrors that state to `localStorage` under the key `meal-planner-auth`
   automatically — you never call `localStorage` yourself.
2. **Axios reads from the store.** `lib/axios.ts` registers a request
   interceptor that calls `useAuthStore.getState().token` (not the React
   hook — this runs outside components) and attaches it as
   `Authorization: Bearer <token>` on every request. So once you're logged
   in, every `gqlRequest` call is authenticated with zero extra code at the
   call site.
3. **Login/register write to the store.** `hooks/useAuth.ts` wraps the
   `login`/`register` mutations in TanStack Query's `useMutation`; on
   success it calls `setAuth(token, user)`, which is what actually
   triggers the `persist` middleware to write to `localStorage`.
4. **Hydration timing.** `localStorage` isn't available during SSR, so
   Zustand rehydrates the store *after* the app mounts. `hasHydrated` in
   the store flips to `true` once that finishes. `components/AuthGuard.tsx`
   (wrapping every page under `app/(app)/`) waits for `hasHydrated` before
   deciding whether to redirect to `/login` — otherwise a logged-in user
   would flash-redirect on every hard refresh, because for a split second
   the store looks empty.
5. **401 handling.** An Axios response interceptor calls `logout()` (which
   clears the store + localStorage) if the backend ever returns a 401, so
   an expired/invalid token doesn't get stuck in a retry loop.
6. **TanStack Query is the data layer**, layered on top of all this: each
   `hooks/use*.ts` file wraps a `lib/api/*.ts` function in `useQuery` /
   `useMutation`, with `invalidateQueries` calls on mutations that should
   refresh cached lists (e.g. saving a recipe invalidates
   `savedRecipes` + `stats`).

## Project structure

```
app/
  login/, register/          — public auth pages
  (app)/                     — everything behind AuthGuard + Navbar
    dashboard/                 search, categories, random meal
    recipes/[id]/               recipe detail, save + add-to-plan
    saved/                       saved recipes list
    meal-plan/                   weekly calendar grid
    stats/                       totals
components/                  — AuthGuard, Navbar, MealCard, small UI bits
lib/
  axios.ts                  — Axios instance + auth interceptor
  graphql/
    client.ts                 gqlRequest() helper
    queries.ts / mutations.ts GraphQL documents (mirrors backend typeDefs)
  api/                      — one file per resource, thin wrappers over gqlRequest
hooks/                      — TanStack Query hooks per resource
store/authStore.ts          — Zustand + persist (localStorage)
types/index.ts              — TS types mirroring the GraphQL schema
```

## Notes

- Set `NEXT_PUBLIC_API_URL` in `.env.local` if your backend isn't on
  `http://localhost:4000/graphql`.
- Recipe thumbnails come from `www.themealdb.com` — already whitelisted in
  `next.config.ts` under `images.remotePatterns`.
