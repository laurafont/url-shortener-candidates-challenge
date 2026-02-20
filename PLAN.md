# URL Shortener — Implementation Plan

Based on [CHALLENGE_DESCRIPTION.md](./CHALLENGE_DESCRIPTION.md). Prioritized for ~2 hours with room to cut scope. Includes SOLID/DDD alignment and file structure.

---

## Priority order

1. Fix code generator
2. Add database (Postgres + Prisma)
3. Add repository layer
4. Refactor loaders/actions (incl. click tracking + list with stats)
5. Security / abuse prevention
6. Frontend improvements (shadcn, validation, loading, errors, toast, empty state)
7. Testing
8. Docker + README + submission

---

## 1. Fix code generator

**Why first:** Current generator uses `"abc"` × length 2 → only 9 codes. Collisions are guaranteed; fixing before adding persistence avoids bad data and keeps the repository API simple.

**Tasks:**

- [ ] **1.1** Move/copy code generation into a dedicated module in the engine (e.g. `libs/engine/src/services/code-generator.ts`).
- [ ] **1.2** Use a larger alphabet (e.g. alphanumeric or base62) and longer length (e.g. 6–8 chars) so the space is large enough (e.g. 62^6 ≈ 56B).
- [ ] **1.3** Keep the function pure (no I/O). It should only return a random code; uniqueness will be enforced by the repository in step 3 (e.g. retry on conflict or “generate until unique” in the application layer).
- [ ] **1.4** Re-export from `libs/engine/src/index.ts` and update `_index` action to use the new module (still in-memory for now).

**Files to touch:** `libs/engine/src/shortened-url.ts`, new `libs/engine/src/services/code-generator.ts`, `libs/engine/src/index.ts`, `applications/web/app/routes/_index.tsx` (if import path changes).

---

## 2. Add database (Postgres + Prisma)

**Why second:** Persistence is required; the repository layer will sit on top of Prisma. Doing DB before repository avoids writing Prisma in loaders and then moving it.

**Tasks:**

- [ ] **2.1** Add Postgres service to `docker-compose.yml` (image, port, optional env for password). Add `depends_on` and `DATABASE_URL` (or equivalent) for the web service.
- [ ] **2.2** Add Prisma to the project (e.g. in `applications/web` or at root if you prefer). Run `pnpm add prisma @prisma/client` and `pnpm exec prisma init`.
- [ ] **2.3** Define schema: at least `ShortLink` (id, code unique, originalUrl, createdAt) and `Click` (id, shortLinkId, createdAt; optional: userAgent, ip for abuse analysis). Relation: ShortLink has many Clicks.
- [ ] **2.4** Add `.env` / `.env.example` with `DATABASE_URL` and document in README. Ensure Docker `DATABASE_URL` points to the Postgres service (e.g. `postgresql://user:pass@postgres:5432/urlshortener`).
- [ ] **2.5** Run migrations (locally and document how to run in Docker — e.g. in Dockerfile, entrypoint script, or one-off container in README).

**Files:** `docker-compose.yml`, `applications/web/prisma/schema.prisma`, `.env.example`, README.

---

## 3. Add repository layer

**Why third:** Keeps domain/application free of infrastructure; enables testing with in-memory impl; satisfies challenge “repository pattern or similar abstraction.”

**Tasks:**

- [ ] **3.1** Define **ports (interfaces)** in the engine. Create e.g. `libs/engine/src/ports/short-link-repository.ts` with interface:
  - `create(data: { code: string; originalUrl: string }): Promise<ShortLink>`
  - `getByCode(code: string): Promise<ShortLink | null>`
  - `listWithStats(): Promise<Array<ShortLinkWithStats>>`
  - `recordClick(code: string): Promise<void>` (or by id)
    Use domain types (e.g. `ShortLink`, `ShortLinkWithStats`) that the engine exports; keep DTOs minimal.
- [ ] **3.2** Implement **Prisma repository** in the web app, e.g. `applications/web/app/infrastructure/prisma/short-link-repository.ts`, implementing the engine’s repository interface. Map between Prisma models and domain types.
- [ ] **3.3** **Wiring:** Create Prisma client and repository instance at app startup (or in a small `app/dependencies.ts` / server entry). Pass the repository into whatever will be called from loaders/actions (see step 4). Do not import Prisma inside `libs/engine`.

**Files:** `libs/engine/src/ports/short-link-repository.ts`, `libs/engine/src/domain/short-link.ts` (or types in a single file), `applications/web/app/infrastructure/prisma/short-link-repository.ts`, wiring in server/entry or `app/dependencies.ts`.

---

## 4. Refactor loaders/actions (incl. click tracking + list with stats)

**Why fourth:** Loaders/actions become thin HTTP layers; business logic and I/O live in application services and repository. This is where click tracking and “list with statistics” are implemented.

**Tasks:**

- [ ] **4.1** **Create short link:** Move create logic into an application service (e.g. `app/services/create-short-link.ts`). It should: validate URL (format, length), generate code (from step 1), call `repository.create()` (retry with new code on unique violation if desired). Action: parse formData, call service, return `{ shortenedUrl }` or `{ error }`.
- [ ] **4.2** **Redirect + click tracking:** In `s.$code` loader: resolve code via repository (`getByCode`). If not found, 404. If found, call `repository.recordClick(code)` (or by id), then `redirect(url)`. Optionally use `isbot` (step 5) to skip recording for bot requests.
- [ ] **4.3** **List with statistics:** Add a loader (e.g. on index or a dedicated route) that calls `repository.listWithStats()` and returns the list. Frontend will consume this in step 6.
- [ ] **4.4** **Backend validation:** Validate URL in the create flow (valid URL format, max length, allowed schemes). Return clear error messages (e.g. “Invalid URL”) in action data.
- [ ] **4.5** Remove direct use of `shortenedUrls` Map and `generateShortCode` from routes; remove or deprecate the Map from `libs/engine` and use repository + code generator only.

**Files:** `applications/web/app/routes/_index.tsx`, `applications/web/app/routes/s.$code.tsx`, new `app/services/create-short-link.ts`, optional `app/services/resolve-and-track.ts`, and any new route for “list” if not on index.

---

## 5. Security / abuse prevention

**Why here:** Challenge asks for “measures to prevent abuse.” Lightweight measures fit well after redirect and create flows exist.

**Tasks:**

- [ ] **5.1** **Bot filtering:** In the redirect path, use `isbot` (already in package.json) to avoid counting bot traffic when calling `recordClick`. Optionally skip redirect for bots or still redirect but don’t record.
- [ ] **5.2** **Rate limiting (optional):** Add simple rate limiting for the “create short link” action (e.g. by IP or by session), to cap abuse. Can be in-memory for the 2h scope (e.g. per-IP counter with a short window). Document in CHALLENGE_SUBMISSION if you skip or simplify.

**Files:** `applications/web/app/routes/s.$code.tsx` (isbot), `applications/web/app/routes/_index.tsx` or a small middleware/helper (rate limit).

---

## 6. Frontend improvements

**Depends on:** Backend exposing create (with validation), list with stats, and redirect with click tracking.

**Tasks:**

- [ ] **6.1** **UI (shadcn):** Add shadcn/ui and build a clean, modern layout. Replace the current “intentionally ugly” form and messages with shadcn components (Button, Input, Card, etc.). Split into components (ShortenForm, ShortenedUrlResult, LinkList, EmptyState) and keep routes thin.
- [ ] **6.2** **Input validation:** Client-side validation on the URL form (required, valid URL format). Show inline errors; keep server-side validation as source of truth and show action errors.
- [ ] **6.3** **Loading and error handling:** Use React Router’s `useNavigation()` to show loading state on submit. Display server errors (e.g. “Invalid URL”, “Something went wrong”) in the UI.
- [ ] **6.4** **Dialog on success:** After a successful create, show an alert dialog (from shadcn UI) with the shortened URL and a “Copy” action.
- [ ] **6.5** **List view with statistics:** Add a view that lists shortened URLs with click counts. Use the loader from step 4.3. Empty state when there are no links (clear message + CTA to create one).
- [ ] **6.6** Use useNavigation() for loading state and aria-busy/disabled for accessibility.

**Files:** `applications/web/app/routes/_index.tsx`, new components under `app/components/` (e.g. `ShortenForm`, `LinkList`, `EmptyState`), shadcn config and components.

---

## 7. Testing

**Tasks:**

- [ ] **7.1** **Code generator:** Unit tests for the new generator (e.g. length, character set, no obvious collisions in a small sample).
- [ ] **7.2** **Repository:** Integration tests for the Prisma repository (create, getByCode, listWithStats, recordClick) using a test DB or SQLite/Postgres test container. Optionally test in-memory implementation if you keep one for tests.
- [ ] **7.3** **Critical paths:** At least one or two tests for the create flow (e.g. action returns shortened URL; invalid URL returns error) and optionally for redirect + click (e.g. redirect and increment). Prefer testing application services or repository; keep route tests minimal if time-constrained.

**Files:** `libs/engine/src/services/code-generator.test.ts`, `applications/web/app/infrastructure/prisma/short-link-repository.test.ts`, and/or `applications/web/app/services/create-short-link.test.ts`, plus any route/action tests.

---

## 8. Docker, README, and submission

**Tasks:**

- [ ] **8.1** **Docker:** Ensure `docker-compose up --build` starts Postgres and web, with correct `DATABASE_URL`. Document how to run migrations (e.g. in README or via entrypoint). Verify the app works (create link, redirect, list with stats).
- [ ] **8.2** **README:** Update the [Docker Setup section](./README.md#docker-setup) with: how to run, that Postgres is included, any env vars (e.g. `DATABASE_URL`), and how to run Prisma migrations if needed.
- [ ] **8.3** **CHALLENGE_SUBMISSION.md:** Fill in what you did, what you’d do with more time, AI usage (and example prompts), and feedback.

---

## Suggested file structure (reference)

```
url-shortener/
├── libs/engine/
│   └── src/
│       ├── domain/
│       │   ├── short-code.ts      # value object / validation
│       │   ├── original-url.ts    # URL validation
│       │   └── short-link.ts      # types / aggregate
│       ├── ports/
│       │   └── short-link-repository.ts  # interface
│       ├── services/
│       │   └── code-generator.ts
│       └── index.ts               # re-exports only
│
├── applications/web/
│   ├── app/
│   │   ├── infrastructure/
│   │   │   └── prisma/
│   │   │       ├── schema.prisma
│   │   │       └── short-link-repository.ts
│   │   ├── services/
│   │   │   ├── create-short-link.ts
│   │   │   └── resolve-and-track.ts  # optional
│   │   ├── routes/
│   │   │   ├── _index.tsx
│   │   │   └── s.$code.tsx
│   │   ├── components/
│   │   │   ├── ui/                 # shadcn
│   │   │   ├── ShortenForm.tsx
│   │   │   ├── LinkList.tsx
│   │   │   └── EmptyState.tsx
│   │   └── root.tsx
│   └── prisma/
│       └── schema.prisma           # if you keep it here
```

---

## Scope cuts (if short on time)

- **First:** Skip or stub rate limiting (5.2); keep bot filtering (5.1).
- **Then:** Reduce frontend polish (e.g. minimal shadcn, skip toast or simplify empty state).
- **Last:** Reduce test coverage to code generator + one repository or one action test; skip Docker if needed but document that “Docker not verified” in submission.

Good luck.
