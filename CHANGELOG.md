# Changelog by Phase

## Phase 1 — Calculation engine and schemas
- Added deterministic solar sizing, roof limit, generation, panel, cost, subsidy, EMI, carbon and 25-year projection functions.
- Added editable JSON config and baseline formula tests.

## Phase 2 — Planner UI
- Added multi-step eligibility, location, consumption, roof and assumptions wizard.
- Added validation, editable assumptions and live preview.

## Phase 3 — Results
- Added system and financial summaries, subsidy breakdown, charts with data tables, EMI and battery calculators.

## Phase 4 — Maps readiness
- Added Maps service boundary and manual location fallback. Google Places autocomplete was added in Phase 8; Google Solar API remains unwired.

## Phase 5 — Optional AI
- Added AI proxy service, number guard, automatic summary/FAQ fallbacks and accessible chatbot UI.

## Phase 6 — Proposal and sharing
- Added proposal IDs, jsPDF proposal builder, EmailJS/manual email fallback, WhatsApp, privacy-safe share links and lead capture.

## Phase 7 — Admin dashboard
- Added demo/Firebase admin authentication path, lead list/detail, status pipeline, revenue calculation, CSV export, notes, deletion confirmation and Firestore rules.

## Phase 8 — Polish and deployment
- Added lazy route/chart/PDF/Places loading, optional Google Places address autofill with manual fallback, English/Hindi language toggle, focus-visible/reduced-motion/responsive CSS, Vercel SPA rewrite/security headers, performance smoke tests, deployment and audit documentation.
- Full npm install/build/test/preview and axe/browser checks could not be completed in the restricted execution environment; see the Phase 8 report and test results.
