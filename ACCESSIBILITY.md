# Accessibility

## Target

WCAG 2.1 AA. Every routed page has a single `<h1>`, landmarks (`<header>`, `<main id="main">`, `<footer>`), a skip link, form fields linked to visible labels with errors announced, and automated axe checks.

## Patterns implemented

Each pattern is listed with the file that owns it so a reviewer can verify at source.

### Skip link + landmarks

`frontend/src/components/SkipLink.tsx` is the first focusable element on every page, visible only when focused, and anchors to `#main`. CSS lives in `src/index.css`.

`frontend/src/App.tsx` renders the shell: `<SkipLink />` then `<AppHeader>` (header landmark) then `<Box component="main" id="main" tabIndex={-1}>` then `<AppFooter>` then `<LiveSnackbar>`. Exactly one of each landmark per page.

### Route-change focus management

`frontend/src/components/FocusOnRouteChange.tsx` listens to every `useLocation` change, queries `main h1`, and focuses it; it falls back to `#main` if a page has no heading. Covered by `FocusOnRouteChange.test.tsx`.

### Form labels, errors, and focus-on-error

`frontend/src/components/FieldText.tsx` is the single wrapper used by every form. It wires `id` (from `name`), `aria-required`, `aria-invalid`, and `aria-describedby={id}-error` automatically. The MUI `TextField` renders a visible `<label htmlFor={id}>` and the helper text becomes the described element.

`frontend/src/hooks/useFocusOnError.ts` focuses the first invalid field by id on submit validation failure. Used by `LoginPage`, `SignupPage`, `AccountPage`, and `PetForm`.

### Announcements (live regions)

`frontend/src/components/LiveSnackbar.tsx` mounts two regions once globally: `role="status"` (polite) and `role="alert"` (assertive). `frontend/src/hooks/useAnnounce.ts` exports the `useAnnounce()` hook; the pair is connected by a module-scoped `EventTarget` so calling `announce()` from anywhere triggers the mounted regions. Used for "Pet added.", "Appointment booked.", 409 "That time was just taken.", logout confirmation, etc.

### Focus-trapped dialogs

`PetForm` (add/edit) and `ConfirmDialog` (delete pet, cancel appointment) use MUI `<Dialog>`. MUI traps focus, closes on Escape, and returns focus to the trigger. `disableEnforceFocus` is never set.

### Icons

`frontend/src/components/Icon.tsx` takes a discriminated union: either `decorative: true` (emits `aria-hidden`) or `label: string` (emits `role="img"` + `aria-label`). Both states are unit-tested. This is the only way `FontAwesomeIcon` is rendered in the app.

### Wizard state invariant

Booking changes in an earlier step must not leak downstream. The invariant is enforced in the reducer at `frontend/src/store/slices/bookingSlice.ts`, not in components. `setService` clears vet/date/slot/pet, `setVet` clears date/slot/pet, and so on. Covered by six invariants in `bookingSlice.test.ts`.

### Time slot picker, not color-only

`frontend/src/features/booking/steps/PickTimeStep.tsx` pairs `aria-pressed="true"` on the selected button with a `faCheck` start icon. Color is never the sole indicator.

### Cancelled-appointment badge, not color-only

`frontend/src/features/appointments/AppointmentsPage.tsx` renders cancelled items with a Chip that combines text ("Cancelled") with a `faBan` icon.

### Theme contrast

`frontend/src/theme.ts` defines primary `#1565C0`, error `#B71C1C`, success `#1B5E20`, warning `#8C4A00`. Each has an explicit `contrastText` and the body text `#1a1a1a` on `#ffffff` easily clears 4.5:1 for normal text.

### Tables with captions

`frontend/src/features/pets/PetDetailPage.tsx` renders vaccinations and conditions as real `<table>` elements with `<caption>`, `scope="col"` on headers, and semantic `<tbody>` rows. Not MUI DataGrid, not divs.

### PDF accessibility

`backend/PetPortal.Api/Pdf/InvoicePdfDocument.cs` uses QuestPDF structural primitives (Column, Table, Text) rather than raw-drawn rectangles. Metadata (`/Info /Title`) is set. `/Lang=en` is added post-generation by `Pdf/PdfPostProcessor.cs` using PdfSharpCore. See the gap below about `/StructTreeRoot`.

## Testing strategy

| Layer | Tool | What it catches |
|---|---|---|
| Static a11y per page | jest-axe inside Vitest | Missing labels, invalid ARIA, duplicate IDs, incorrect roles. Runs in CI via `npm test`. |
| Route focus | Vitest unit test of `FocusOnRouteChange` | Regressions in the focus-on-route-change invariant |
| Keyboard-only journey | Playwright (`tests/e2e/keyboard-flow.spec.ts`) | End-to-end signup → add pet → full booking wizard, all with `.focus()` + `keyboard.press()` + `fill()`, no `.click()` calls |
| PDF | pikepdf (`tools/pdf-a11y-check/check_pdf.py`) in Docker | `/Lang`, title metadata, structure tree presence, image alt text |
| Manual | Screen reader + keyboard walkthrough | Reading order, landmark announcements, focus visible after every transition |

## Recommended manual verification

- **Screen reader:** NVDA on Windows, VoiceOver on macOS. Walk the full flow from `/signup` through to a cancelled booking. Confirm the skip link announces first, the `<h1>` lands on focus after navigation, form errors are announced on submit, and live-region messages (e.g. "Pet added.") are heard.
- **Unplug the mouse.** Repeat the signup → add pet → book appointment journey with the keyboard only. Everything should be reachable; focus should always be visible; Escape should close both dialogs.
- **Invoice PDF:** download a PDF from the appointments page, open it in a tagged-PDF-aware reader (Acrobat's Read Out Loud, or NVDA over Acrobat) and confirm the language is spoken correctly and the content reads in logical order.

## Deliberate tradeoffs

### Invoice PDFs are not tagged (no `/StructTreeRoot`)

`/Lang=en`, `/Info /Title`, and absence of untagged image XObjects all pass the pikepdf check. `/StructTreeRoot` is missing because **QuestPDF Community does not emit a tagged PDF**. It positions content visually without mapping each block to a semantic role (heading, paragraph, table cell).

Fixes if this were production:

- Use a commercial tagging-capable library (iText7 with a commercial licence, or a rendering service that emits PDF/UA).
- Post-process the QuestPDF output with `pikepdf` to synthesise a minimal `/StructTreeRoot` with `/Document` → `/Sect` → `/P`/`/H1`/`/Table` roles, assigned by walking the content stream.

The Python checker reports this as `FAIL` honestly rather than silencing the check. Trading rigour for a demo-sized fix would hide the gap from reviewers.

### Backend integration tests use an in-memory database

`backend/PetPortal.Tests/TestWebApplicationFactory.cs` swaps `UseNpgsql` for `UseInMemoryDatabase`. That speeds the test suite from "needs Postgres running" to "starts in milliseconds", at the cost of not exercising the real provider's unique-constraint semantics or the generated migration. The booking double-book test does still prove the unique index behaviour in-memory. For a production codebase, a Testcontainers-backed integration layer in addition to this would be worth adding.

### No automated color-contrast audit beyond axe

axe-core detects obvious color-contrast failures but is not an exhaustive audit; a dedicated tool such as Pa11y, WAVE, or a manual Colour Contrast Analyser pass against the palette would be stronger. The theme colours in `theme.ts` were picked to clear WCAG AA for the body text/background combination, but a formal audit would also walk every state (hover, focus, disabled, selected) which is not performed here.

### FluentValidation.AspNetCore swapped for .DependencyInjectionExtensions

Not strictly an accessibility tradeoff, but worth flagging in the same place: `FluentValidation.AspNetCore` 11.3.0 is the last release and its MVC `ApplicationPart` integration broke `WebApplicationFactory` tests with an assembly-load failure. Replaced with `FluentValidation.DependencyInjectionExtensions` 11.9.2 which exposes the same `AddValidatorsFromAssemblyContaining<T>()` API without the legacy integration. No behavioural difference at runtime.

## What I'd improve with more time

- **Tagged PDF output.** Either switch to a tagging-capable PDF library or add a `pikepdf` pass that synthesises `/StructTreeRoot` from the QuestPDF content stream. That's the one real a11y gap in the app.
- **Route-level code splitting.** The SPA bundle is ~970 kB, mostly MUI. Route-level `React.lazy` would get it under 500 kB and noticeably improve first-paint on low-bandwidth connections.
- **Focus ring theming.** MUI's default `:focus-visible` ring is fine but a custom styled ring keyed to the primary colour would be crisper and would line up with the brand.
- **Live-region verbosity tuning.** A few low-priority status messages (successful navigation, a11y-neutral operations) could be dropped. Currently the polite region announces everything; some of that could be silent for returning users.
- **Formal screen-reader walkthrough checklist.** A written, step-by-step NVDA + VoiceOver protocol stored alongside this doc would let reviewers reproduce the manual pass consistently.
- **Testcontainers-backed backend integration tests.** Real Postgres in CI to exercise the actual migration and the real unique-constraint behaviour end-to-end.
- **Contrast audit per state.** Not just the palette in its default state; every interactive element in every state against every background.
