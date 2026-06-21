# Ratio architecture

## Product boundary

Ratio is a single Next.js application. Pages, authentication, mutations, administration, and the health endpoint deploy as one Vercel project. PostgreSQL is the only stateful dependency. This is intentionally a modular monolith: the MVP gets atomic data changes and simple operations without committing to service boundaries before traffic justifies them.

## Rendering

Pages are React Server Components by default. They read directly through Prisma and send minimal browser JavaScript. The only client component is the recoverable error screen. Forms use Server Actions, preserving progressive enhancement and keeping validation and authorization close to each mutation.

## Data model

- `User` supports one unique email or phone identifier, a bcrypt hash, profile fields, and a `USER` or `ADMIN` role.
- `Poll` owns ordered `PollOption` records and has explicit draft, published, and closed states.
- `Vote` is append-only by round. Its compound unique key prevents duplicate rounds for one person and poll.
- `Argument` has a deliberate `FOR` or `AGAINST` side and a moderation state.
- `Rebuttal` is one level deep. Avoiding arbitrary nesting keeps reading and moderation focused.
- `RateLimit` stores hashed actor keys in fixed time windows, making throttles work across serverless instances.

Foreign keys cascade when their owning aggregate is deleted. Query paths used by dashboards and poll pages have explicit indexes.

## Authentication and authorization

Registration accepts either an email or an international phone number. Passwords use bcrypt with cost 12. A signed JWT contains only user ID and role and is stored in a 30-day HTTP-only, secure, same-site cookie. Database lookup remains the source of truth for the current profile and role.

Authentication proves knowledge of the password, not ownership of the address or number. Verified email or SMS OTP can be added later using the same user record. Production policy should require verification before sensitive notifications or account recovery.

All protected actions call `requireUser`; moderation actions call `requireAdmin`. UI visibility is convenience only and is never the authorization boundary.

## Consensus calculation

Round one is the baseline. Round two is the final position after review. Results use each participant's latest vote, while the initial result always reads round one. A changed-position metric compares option IDs between rounds. Confidence is retained per round for later analysis without complicating the MVP dashboard.

## Security posture

- Zod validates form data on the server.
- Poll state, close time, option membership, role, and revote count are checked before writes.
- Server Actions enforce same-origin requests; request bodies are limited to 1 MB.
- Security headers disable framing, MIME sniffing, sensitive browser capabilities, and cross-origin opener sharing.
- Authentication and public writes use database-backed limits.
- Secrets are server-only, and production refuses to boot without `AUTH_SECRET`.
- React escapes user content; the app does not render user-supplied HTML.

## Reliability and operations

Prisma owns connection reuse in development and provides migration SQL for deployment. Managed serverless PostgreSQL should expose a pooled connection string. `/api/health` checks database reachability for uptime systems. Global loading, not-found, and recoverable error states prevent dead-end pages.

Vercel runs `prisma generate` before the Next.js production build. Schema migrations should run as a separate release step, preventing web instances from racing to alter the database.

## UI system

The design uses native CSS variables and a small set of reusable components instead of a UI framework. Electric blue communicates action and information; teal marks reflection and positive movement. Dark navy gives the brand authority without borrowing the visual language of social feeds. Layouts collapse at 900 px and 650 px, with full-width actions and single-column reading on small screens.

## Scaling path

The first extraction point is analytics, not core voting. Materialized aggregates or a warehouse can absorb expensive historical analysis while PostgreSQL remains authoritative. If moderation volume grows, argument review can move to a queue-backed workflow. Neither change requires rewriting the poll or vote contracts.
