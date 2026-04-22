# PetPortal

PetPortal is a demonstration project built for code review, pet appointment booking app showing the patterns, accessibility approach, and code quality I work to day-to-day. Full write-up is in [ACCESSIBILITY.md](./ACCESSIBILITY.md).

It's a small booking application for pet owners. Functionalities include: sign up, manage pets, book vet appointments, view upcoming and past appointments, download invoice PDFs.


## Quick start

Only prerequisite: **Docker Desktop** (or Docker Engine + Compose).

```bash
docker compose up --build
```

First boot takes a minute or two while images build. When it is done:

- Frontend: **http://localhost:5173**
- Swagger (direct backend access for review): **http://localhost:5069/swagger**

The backend migrates the schema and seeds the database on first startup, idempotently, so subsequent restarts are no-ops. Database state persists in the `pgdata` named volume; `docker compose down -v` wipes it.

## Test credentials

Sign in with the seeded user, or register a fresh account via the sign-up flow.

| Field | Value |
|---|---|
| Email | `test@example.com` |
| Password | `Password123!` |

The seeded user owns two pets (Rex the dog, Luna the cat), with four invoices (`INV-001` through `INV-004`) split across two past completed appointments and two upcoming booked ones.

## What you can do

- Sign up / log in with an HttpOnly `pp_auth` cookie.
- Manage pets: add, edit, delete (409 if the pet has upcoming appointments).
- Browse a pet's detail page: vaccinations and conditions rendered as semantic tables.
- Book an appointment through a 6-step wizard. The wizard clears every downstream selection if you change an earlier one, enforced in the Redux reducer, not the components.
- View upcoming and past appointments. Cancel upcoming ones. Download the invoice PDF for any appointment (invoice created atomically alongside each appointment).
- Edit phone or address on the account page. Email and name are read-only.

## Scope and out of scope

**In scope:** the flows above, real data stored in Postgres, keyboard-accessible interactions, axe-clean pages, an end-to-end keyboard Playwright test.

**Out of scope** (deliberately, so the review stays under ~15 minutes):

- Vet / admin UI. No interface for practitioners.
- Real payments. Invoices are informational only.
- Notifications. No email, SMS, or push.
- Multi-tenancy. Single organisation.
- Refresh tokens, password reset, email verification, 2FA.
- Editing or rescheduling an appointment in place. Cancel and rebook instead.
- Dark mode, i18n, mobile-native layouts (the UI is responsive for desktop + mobile-web).

## Tech stack

**Frontend:** React 18 + TypeScript (strict), Vite, Redux Toolkit, React Router v6, MUI + MUI X Date Pickers (Luxon adapter), react-hook-form + zod, axios, FontAwesome.

**Backend:** .NET 8 ASP.NET Core Web API, Entity Framework Core + Npgsql, PostgreSQL 16, BCrypt.Net-Next, FluentValidation, QuestPDF (Community), JWT via HttpOnly cookie, fixed-window rate limiter on `/api/auth/*`.

**Testing:** Vitest + @testing-library + jest-axe (frontend), xUnit + WebApplicationFactory (backend), Playwright (E2E), pikepdf in a dockerised checker (PDF accessibility).

## Architecture

Three containers under `docker compose`: `db` (Postgres), `backend` (.NET 8 API), `frontend` (nginx serving the built SPA and reverse-proxying `/api` to the backend). The frontend bundle is built into static assets during the image build; nginx handles SPA fallback so deep links like `/pets/{id}` resolve on refresh.

Auth is cookie-based (HttpOnly `pp_auth`). Axios sends `withCredentials: true` on every request; a response interceptor clears local auth state and redirects to `/login` on 401 (except for the boot `/api/me` probe and `/api/auth/*` attempts). A single Redux `bookingSlice` owns all wizard state with an invariant enforced in the reducers: setting an earlier selection (service/vet/date/slot) clears every downstream field so stale state can't leak.

## Running tests

| What | Command | What it covers |
|---|---|---|
| Backend integration tests | `cd backend && dotnet test` | 8 tests covering auth (signup/login/me/duplicate) and booking (full-flow plus double-book 409) against an in-memory database |
| Frontend unit + a11y tests | `cd frontend && npm test` | 43 tests across 14 files covering Redux slice invariants, `useFocusOnError`, `Icon`, `FocusOnRouteChange`, and jest-axe assertions on every page plus the ConfirmDialog |
| Frontend linter | `cd frontend && npm run lint` | ESLint 9 + TypeScript-ESLint + react-hooks + react-refresh rules |
| Keyboard-only E2E | `cd frontend && npx playwright install chromium && npm run test:e2e` | One spec that signs up, adds a pet, and walks all 6 wizard steps via `focus()` + `keyboard.press()` + `fill()`, with no `.click()` calls. Needs the stack running (use `docker compose up --build` in another terminal). |
| PDF accessibility checker | `docker build -t pdf-a11y-check tools/pdf-a11y-check && docker run --rm -v $(pwd)/tmp:/in pdf-a11y-check /in/invoice.pdf` | Four pikepdf checks: `/Lang`, `/Info` title, `/StructTreeRoot`, image `/Alt`. Three pass; `/StructTreeRoot` fails honestly (see ACCESSIBILITY.md). |

## Known limitations

- **Invoice PDFs lack `/StructTreeRoot`.** QuestPDF Community doesn't emit tagged PDFs. `/Lang` is added via a post-processing step with `PdfSharpCore`; a real production deployment would use a commercial tagging library or post-process with `pikepdf` to synthesise the structure tree. Documented in ACCESSIBILITY.md.
- **Frontend bundle is ~970 kB.** MUI is heavy; route-level code-splitting with `React.lazy` would bring this under the 500 kB warning threshold.
- **`FluentValidation.AspNetCore` is deprecated** at 11.3.0 (the final release). We use `FluentValidation.DependencyInjectionExtensions` 11.9.2 instead, which exposes the same `AddValidatorsFromAssemblyContaining<T>()` API without the legacy MVC ApplicationPart integration that broke `WebApplicationFactory` tests.

## Stopping

```bash
docker compose down      # keep the database volume
docker compose down -v   # also wipe the database so the next boot re-seeds
```
