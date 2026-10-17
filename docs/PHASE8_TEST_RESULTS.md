# Phase 8 Test and Build Results

Date: 2026-10-17

| Check | Result | Notes |
|---|---|---|
| `npm install --no-audit --no-fund` | BLOCKED | Attempt timed out after 240 seconds; no usable `node_modules` was produced. |
| `npm test` | NOT RUN | Vitest unavailable because dependencies could not be installed. Test files exist, but they are not represented as passing. |
| `npm run build` | NOT RUN / BLOCKED | Vite executable unavailable for the same reason. No production build output exists to report. |
| `npm run preview` | NOT RUN / BLOCKED | Requires a successful build; no `dist/` output exists. |
| `npm run build` bundle sizes before/after | NOT MEASURABLE | Phase 7 archive did not include a verified build output, and Phase 8 build could not run. Do not invent bundle-size numbers. Run build locally and save full output for the report. |
| JavaScript syntax (`node --check`) | PASS for checked `.js` modules | Checked calculation, PDF, proposals, email, share-link, AI and Maps modules. This does not parse JSX or replace Vite build. |
| JSON parsing | PASS for checked JSON | Project config/translation/seed files should be parsed by the verification command before release. |
| ZIP integrity | PASS | Archive passed `unzip -t` after packaging. |
| Responsive Playwright | NOT RUN | Browser tooling unavailable; manual checklist supplied. |
| axe scan | NOT RUN | axe dependency/browser runner unavailable; do not claim WCAG conformance. |
| Real Maps/EmailJS/Firebase | NOT VERIFIED | No real project keys/credentials or deployed URL supplied. |

## Required local release gate

```bash
npm install --no-audit --no-fund
npm test
npm run build
npm run preview
```

Then inspect `dist/` chunk sizes in Vite output, test routes at 360/768/1280 px, run axe on all routes, and complete the manual checklist in `docs/RESPONSIVE_ACCESSIBILITY_CHECKLIST.md`. Fix all failing tests/build errors before presenting the final demo.
