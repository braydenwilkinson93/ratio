# Ratio

Ratio is a production-ready MVP for informed consensus. People cast an initial vote, review arguments and rebuttals, then cast one final vote. The result dashboard preserves both rounds so opinion movement is visible rather than overwritten.

## Stack

- **Next.js 16 + React 19 + TypeScript**: one deployable application with server-rendered pages and server actions.
- **PostgreSQL + Prisma**: relational integrity, transaction-safe writes, explicit indexes, and portable managed hosting.
- **Signed cookie authentication**: password-based email or phone onboarding with bcrypt hashing and HTTP-only, same-site cookies.
- **Zod validation**: all public writes are validated again on the server.
- **Database-backed rate limits**: authentication and contribution limits remain consistent across serverless instances.
- **Vercel**: zero custom server process; the included health endpoint supports uptime monitoring.

## Run locally

1. Copy `.env.example` to `.env` and set a PostgreSQL connection plus a random `AUTH_SECRET`.
2. Install packages: `npm install`
3. Create the schema: `npm run db:push`
4. Add demo data: `npm run db:seed`
5. Start Ratio: `npm run dev`

The seeded administrator uses `ADMIN_EMAIL` and `ADMIN_PASSWORD`. Defaults are for local development only and must be changed before deployment. A sample member is `maya@example.com` / `DemoPass123!`.

## Deploy to Vercel

1. Create a PostgreSQL database with Neon, Supabase, Vercel Postgres, or another managed provider.
2. Import this directory into Vercel.
3. Add `DATABASE_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_APP_URL`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`.
4. Run `npx prisma migrate deploy` against production. For the first MVP deployment, `npx prisma db push` is acceptable; use committed migrations after the schema begins evolving.
5. Deploy. Vercel runs `npm run build`, which generates the Prisma client first.

## Architecture decisions

### Immutable voting rounds

Votes use a unique `(userId, pollId, round)` key. Revoting inserts round two instead of changing round one. This preserves the original opinion and supports truthful "changed position" metrics. The server allows at most two rounds and checks that the option belongs to the poll.

### Server-first mutation boundary

Forms call server actions directly. Every action authenticates, validates input, checks ownership or poll state, writes through Prisma, and revalidates the affected route. This avoids duplicating a separate REST client while retaining a secure server boundary.

### Simple, portable authentication

The MVP accepts either a normalized email address or E.164-style phone number plus a password. Passwords use bcrypt cost 12. Sessions are signed JWTs stored only in secure HTTP-only cookies. This removes dependency on a particular email or SMS vendor. Production teams can add verified magic links or OTP delivery without changing the user or session model.

### Relational discussion model

Arguments belong to a poll and have an explicit side. Rebuttals belong to an argument. Both include moderation flags and indexed query paths. The model deliberately avoids unlimited reply depth, which keeps the interface focused and moderation tractable.

### Role-based administration

Admin authorization is checked server-side. Admins can change poll publication state and hide or restore arguments. The dashboard also exposes product-level counts useful for early operations.

### Serverless-safe abuse controls

Rate-limit counters are stored in PostgreSQL rather than process memory, so limits continue to work when Vercel scales requests across instances. Identifiers are SHA-256 hashed before storage. A scheduled cleanup of expired windows can be added once traffic volume warrants it.

### Deliberately small production surface

The app has no client state framework or external UI kit. Server components handle reads; progressive HTML forms handle writes. This reduces JavaScript, deployment complexity, and third-party attack surface while keeping all required workflows responsive.

## Production checklist

- Replace development credentials and generate `AUTH_SECRET` with at least 32 random characters.
- Use pooled PostgreSQL connections appropriate for serverless workloads.
- Add verified email/SMS delivery before treating phone or email ownership as confirmed.
- Add an edge firewall in front of the included application-level rate limits for defense in depth.
- Add error monitoring, analytics with consent, database backups, and a privacy policy.
- Commit Prisma migrations and run them in CI before production deploys.
- Add Playwright end-to-end coverage for registration, both vote rounds, moderation, and mobile layouts.
