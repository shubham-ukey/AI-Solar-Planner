# AI Solar Installation Planner

A React + Vite rooftop-solar planning and proposal application. It estimates system size, generation, subsidy, costs, savings, payback, EMI and 25-year projections from editable JSON assumptions. It includes optional AI summary/FAQ, proposal PDF, EmailJS/manual email fallback, WhatsApp and privacy-conscious share links, plus an admin lead pipeline.

> **Demo only:** subsidy, tariff, PSH, system-cost and emissions values are not all verified. Do not use this application as an official subsidy eligibility decision, structural/electrical design, installer quote, or financial guarantee. Verify each value against the official source listed in `docs/DATA_ACCURACY_CHECKLIST.md` and record the verification date before the final demonstration.

## Requirements and setup

- Node.js 20.19+ or a Node version supported by the installed Vite release.
- npm.

```bash
npm install
cp .env.example .env
npm run dev
```

Windows PowerShell: `Copy-Item .env.example .env`. Keep `.env` local and never commit it. Blank/disabled optional integrations must continue to use their documented fallback.

## Scripts

- `npm run dev` — local Vite server.
- `npm test` — Vitest unit/component tests.
- `npm run test:watch` — interactive Vitest.
- `npm run build` — production bundle in `dist/`.
- `npm run preview` — serve the built bundle locally; run `npm run build` first.

Performance smoke checks are in `src/tests/performance.test.js`. They test deterministic calculation loops and PDF document creation, but the machine/network build and full test suite must be run locally before claiming release readiness.

## Environment variables

All `VITE_*` values are embedded in the browser build and are **public**. Never put a private API key in a `VITE_*` variable.

| Variable                       | Visibility                       | Purpose                                                                                                                                                                                                                                                           |
| ------------------------------ | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `VITE_ENABLE_GOOGLE_MAPS`      | Public toggle                    | Enable Maps UI only if a real Maps integration is present. A lazy-loaded Places Autocomplete component fills formatted address, city, state, PIN code and coordinates when the Maps key is configured; manual entry remains available if disabled or unavailable. |
| `VITE_GOOGLE_MAPS_API_KEY`     | Public browser key               | Google Maps browser API key; restrict by HTTP referrer and API.                                                                                                                                                                                                   |
| `VITE_ENABLE_SOLAR_API`        | Public toggle                    | Reserved for optional Google Solar API; not wired into this version.                                                                                                                                                                                              |
| `VITE_ENABLE_AI`               | Public toggle                    | Enables AI only when set to `true`.                                                                                                                                                                                                                               |
| `VITE_AI_PROXY_URL`            | Public URL                       | Backend proxy URL, e.g. `/api/ai`; no provider secret here.                                                                                                                                                                                                       |
| `AI_PROVIDER_API_KEY`          | **Secret, server-only**          | Provider key used by `api/ai.js`; set in Vercel project environment settings, never as `VITE_*`.                                                                                                                                                                  |
| `AI_PROVIDER_URL`              | Server-side config               | OpenAI-compatible provider endpoint used by proxy.                                                                                                                                                                                                                |
| `AI_MODEL`                     | Server-side config               | Provider model name.                                                                                                                                                                                                                                              |
| `VITE_ENABLE_EMAILJS`          | Public toggle                    | Enables EmailJS when all three identifiers are present.                                                                                                                                                                                                           |
| `VITE_EMAILJS_SERVICE_ID`      | Public                           | EmailJS service ID.                                                                                                                                                                                                                                               |
| `VITE_EMAILJS_TEMPLATE_ID`     | Public                           | EmailJS template ID.                                                                                                                                                                                                                                              |
| `VITE_EMAILJS_PUBLIC_KEY`      | Public                           | EmailJS public key. Restrict allowed origins in EmailJS.                                                                                                                                                                                                          |
| `VITE_ENABLE_FIREBASE`         | Public toggle                    | Enables Firebase services/auth when configured.                                                                                                                                                                                                                   |
| `VITE_FIREBASE_API_KEY`        | Public web config                | Firebase browser config, not an authorization boundary.                                                                                                                                                                                                           |
| `VITE_FIREBASE_AUTH_DOMAIN`    | Public web config                | Firebase Auth domain.                                                                                                                                                                                                                                             |
| `VITE_FIREBASE_PROJECT_ID`     | Public web config                | Firebase project ID.                                                                                                                                                                                                                                              |
| `VITE_FIREBASE_APP_ID`         | Public web config                | Firebase app ID.                                                                                                                                                                                                                                                  |
| `VITE_FIREBASE_STORAGE_BUCKET` | Public web config                | Firebase storage bucket, currently not required by core flow.                                                                                                                                                                                                     |
| `VITE_ADMIN_DEMO_PASSWORD`     | **Public in the browser bundle** | Local demo login only. Never use it for production authentication.                                                                                                                                                                                                |

## Project structure

```text
src/
  components/  reusable wizard, result, sharing, chart and admin UI
  config/      JSON assumptions, central/state subsidy, DISCOM data
  context/     wizard and language state
  data/        fictional seed leads
  engine/      deterministic calculations and revenue logic
  hooks/       plan calculation hook
  i18n/        English and Hindi translation dictionaries
  pages/       Home, Planner, Results, shared plan and admin routes
  services/    AI, email, Maps feature flag, PDF, proposal, lead and auth services
  tests/       Vitest and React Testing Library tests
  utils/       schemas, formatting, share links, CSV and pure rules
api/ai.js      optional server-side AI proxy example
firestore.rules
vercel.json
```

## Updating data and assumptions

- `src/config/central_subsidy.json`: scheme name, slabs, cap, source URL and `lastVerified`. The current values follow the supplied SRS acceptance criteria, but are marked `NOT_VERIFIED`; confirm current eligibility and amounts in the official MNRE/PM Surya Ghar documents before the demo.
- `src/config/state_subsidy.json`: empty by design. Add a state only after finding an official state government, regulator or DISCOM source; do not interpret an empty list as proof no state scheme exists.
- `src/config/discoms.json`: contains a generic Maharashtra/DISCOM entry and a placeholder ₹7/unit tariff. Replace with current tariff schedule and source/date.
- `src/config/assumptions.json`: PSH 4.5, PR 0.78, 540 W panel, ₹60,000/kW, tariff/export rate ₹7, 0.5% degradation, 4% tariff escalation, 9% loan rate, 0.82 kg CO₂/kWh, roof area 100 sq ft/kW, direction/shadow factors, inverter size list and battery depth-of-discharge values. These are model defaults, not universal verified truths.
- Update `lastVerified` only on the date a named official source was actually checked. Store the source URL and document the date. Do not change `NOT_VERIFIED` to a date merely to remove a warning.
- After any config change run `npm test` and compare at least 10 scenarios with independently calculated reference cases.

## Language toggle

A small built-in dictionary setup is used instead of a third-party dependency: `src/i18n/en.json`, `src/i18n/hi.json`, and `src/context/I18nContext.jsx`. Language choice is persisted in local storage and updates `<html lang>`. Missing keys fall back to English, then to the key. Calculation values, units and formulas are unchanged. Hindi copy is a first-pass translation and should be reviewed by a fluent Hindi speaker before a public demo. AI output remains in its generated language and is not translated.

## Security and privacy

- `vercel.json` provides SPA fallback and basic security headers. Review the CSP against actual integrations before deployment; tighten it further with nonces if inline scripts are introduced.
- Google Maps keys are browser-visible: restrict by HTTP referrer to localhost development origins and the exact deployed Vercel domains, and restrict enabled APIs in Google Cloud Console. Places Autocomplete is implemented in the lazy-loaded `MapsLocation` component; a real key and referrer restrictions are still required to verify it live.
- AI provider calls must go through `/api/ai` or another server proxy. Keep `AI_PROVIDER_API_KEY` server-side. Add production authentication, rate limiting, request-size limits and abuse monitoring before exposing it publicly.
- EmailJS values are public by design; configure allowed origins, template recipient constraints and quotas. The app sends a summary/link rather than a PDF attachment.
- The demo admin password is bundled into the client and is not secure. Use Firebase Auth with server-assigned admin custom claims and Firestore rules for production.
- `firestore.rules` restrict lead/proposal access to users with `admin == true` custom claims. Assign claims only from a trusted server environment.
- User-entered lead fields are retained for proposal follow-up after consent. Local demo mode stores records in browser storage; deleting local storage or changing browsers can lose them. Do not put sensitive real customer data in a public demo.

## Vercel deployment

1. Commit/push this project to your GitHub repository. Check `git status` and verify `.env` is ignored before pushing.
2. In Vercel, select **Add New → Project**, import the repository, use the Vite defaults (`npm run build`, output `dist`).
3. Add required public variables from the table above. For a no-integration demo, leave the optional toggles `false` and URLs/keys blank. For AI, set `VITE_ENABLE_AI=true`, `VITE_AI_PROXY_URL=/api/ai`, and add server-only `AI_PROVIDER_API_KEY`, optional `AI_PROVIDER_URL`, and `AI_MODEL` in Vercel Environment Variables.
4. If using EmailJS, add its service ID, template ID, public key and set `VITE_ENABLE_EMAILJS=true`; allow your exact deployed domain in EmailJS settings.
5. If using Firebase, add the Firebase web config and `VITE_ENABLE_FIREBASE=true`; enable Email/Password Auth, assign the admin custom claim from a trusted server, and deploy `firestore.rules`. A Firebase web API key is public; rules are what protect data.
6. Do not use `VITE_ADMIN_DEMO_PASSWORD` for production. Set no demo password in the public deployment, or disable demo login in a production-specific follow-up.
7. Deploy, then test direct refresh of `/planner`, `/results`, `/shared`, `/admin`, `/admin/leads`, and `/admin/leads/<id>`. `vercel.json` rewrites SPA routes to `/index.html`; serverless `/api/ai` remains a function route.
8. Google Cloud Console → APIs & Services → Credentials → select browser key → Application restrictions **Websites (HTTP referrers)**. Add `http://localhost:5173/*` for local development and `https://<your-project>.vercel.app/*` plus your custom domain. API-restrict it to only required Maps JavaScript/Places/Geocoding APIs. Do not use an unrestricted key.
9. If deploying the AI proxy to Render/Railway instead, deploy `api/ai.js` as a Node server endpoint, set the provider key as a server secret, configure CORS to your Vercel origin, enforce authentication/rate limits/size limits, then set `VITE_AI_PROXY_URL` to the HTTPS endpoint and redeploy the frontend.
10. After every environment change, redeploy because `VITE_*` values are build-time variables.

## Known limitations

- Places Autocomplete is implemented as a lazy-loaded optional component, with manual entry fallback. No real Maps key was supplied, so the deployed autocomplete and referrer restrictions remain unverified. Google Solar API is not wired into this version.
- Subsidy/tariff/PSH/cost/emission assumptions require official-source review.
- No live production EmailJS or Firebase credentials were provided, so external sends/auth/Firestore rules were not tested against real services.
- Firebase public lead intake needs a server-side function to preserve admin-only Firestore write rules while allowing consented public lead creation.
- Admin demo login is not secure.
- Hindi translations need review; many deep subcomponents remain English until their labels are added to the dictionary.
- Mobile, keyboard and contrast improvements need a real-browser and axe run before claiming WCAG conformance.

## Screenshot checklist for project report

1. Home page in English and Hindi.
2. Eligibility and location step with manual entry fallback.
3. Consumption input and assumption editor with live preview.
4. Results summary cards and subsidy source/verification status.
5. Charts plus their data tables.
6. AI disabled fallback summary and FAQs.
7. PDF proposal open, showing ID, costs, subsidy and disclaimer.
8. WhatsApp share text / copied privacy-safe share link.
9. Shared-plan view and invalid-link error.
10. Admin login, pipeline counts, filters and revenue estimate.
11. Lead detail, status history, notes and delete confirmation.
12. Mobile screenshots at 360px, 768px and 1280px with browser width visible.

## Acceptance, accuracy and deployment reports

See `docs/ACCEPTANCE_AUDIT.md`, `docs/DATA_ACCURACY_CHECKLIST.md`, `docs/RESPONSIVE_ACCESSIBILITY_CHECKLIST.md`, `docs/SECURITY_REVIEW.md`, and `docs/DEPLOYMENT.md`.
