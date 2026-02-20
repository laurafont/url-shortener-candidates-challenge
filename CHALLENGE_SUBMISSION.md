# Submission

## What I Did

I refactored the URL shortener following the implementation plan (steps 1–6) and addressed most requirements:

**1. Code Generator** – Replaced the collision-prone generator with a base62 (0–9, a-z, A-Z) implementation producing 6-character codes (~56B combinations). Kept it pure (no I/O); uniqueness is enforced by the repository.

**2. Database** – Added Postgres via Docker Compose and Prisma 7. Schema: `ShortLink` (id, code unique, originalUrl, createdAt) and `Click` (id, shortLinkId, createdAt, optional userAgent/ip). Migrations run locally or via `docker-compose run --rm web pnpm exec prisma migrate deploy`.

**3. Repository Layer** – Introduced a port (interface) in the engine (`ShortLinkRepository`: create, getByCode, listWithStats, recordClick) and a Prisma implementation in the web app. Domain types (`ShortLink`, `ShortLinkWithStats`) live in the engine; the app maps Prisma models to them. Wired via `app/dependencies.ts`.

**4. Loaders/Actions** – Thin HTTP layer. Create flow uses `createShortLink` service (URL validation, retry on unique violation). Redirect flow in `s.$code` resolves via `getByCode`, records clicks, then redirects. Index loader calls `listWithStats` for the link list. Removed use of the in-memory Map.

**5. Security** – Bot filtering: `isbot` used in the redirect path so crawlers don’t increment click counts. Rate limiting: simple per-request check for the create action.

**6. Frontend** – Clean UI with shadcn-style components (Button, Input, Dialog), form validation, loading states, success dialog with copy, link list with click stats, and an empty state.

**7. Testing** – Unit tests for the code generator (length, character set, randomness).

## What I Would Do With More Time

- **Integration tests** – Repository and create-short-link service tests against a test DB.
- **Polish UI and accessibility** – Improve contrast, focus states, ARIA labels.
- **Performance optimization** – Pagination or virtual scrolling for the link list; DB indexes on `code` and `shortLinkId`; lazy load heavy components; consider TanStack Query for client-side caching and auto-refresh.

## AI Usage

Task was done using Cursor AI. I gave this initial prompt:

Based on the requirements outlined in this file, help me elaborate a detailed step by step plan to complete the task. I would like to create a PLAN.md file for this, but first let's brainstorm it together.
I would first want to prioritize the tasks:

1. Fix code generator
2. Add database (postgres + prisma)
3. Add resporitory layer
4. Refactor Loaders/Actions
5. Frontend improvements:

- add proper UI (using shadcn UI)
- input validation
- loading and error handling
- toast on success
- clear empty state

7. Add testing
   Please tell me:
1. what do you think about the strategy and priorization?
1. Is there anything important missing?
1. Any improvements regarding SOLID and DDD principles? Include file structuring improvements.

AI agreed with my prioritization but noted three gaps in the requirements: click tracking, abuse prevention, and backend URL validation. I had AI draft PLAN.md from my list plus these additions. I then implemented each step with AI support, reviewing and validating before moving on.

## Feedback

The challenge is well-scoped and engaging, the mix of frontend, backend, persistence, and architecture keeps it interesting. The requirements gave clear direction without feeling prescriptive.

What I found trickiest: Docker + Prisma 7 setup—port mapping and Prisma 7’s constructor types required some debugging.

Overall, a solid technical challenge.
