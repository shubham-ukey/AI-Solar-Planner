# Phase 6 — Proposal and Sharing

## Built
- SRS-style proposal IDs: `SOL-YYYY-0001`. `formatProposalId(year, sequence)` is pure; `nextProposalId()` allocates a persisted local sequence for normal browser use.
- Direct jsPDF generation on A4 with automatic page breaks, wrapped text, footer/page numbers, vector 25-year savings chart, summary table, customer/system/subsidy/cost/payback/EMI/assumptions, summary + FAQs, terms and exact disclaimer. No html2canvas or html2canvas-pro is needed because the chart is drawn with jsPDF vector lines and shapes; there is no DOM screenshot or raster chart to capture.
- Proposal summary accepts an AI response only when Phase 5 reports AI as its source and the numeric guard accepts it. Otherwise it uses the deterministic fallback summary.
- EmailJS is optional. The browser uses only service ID, template ID and public key. If disabled/unconfigured or failed, the user receives a prefilled `mailto:` link with summary and plan link.
- Email form uses React Hook Form + Zod, explicit consent, 10-digit Indian phone validation, and a 60-second client-side cooldown.
- WhatsApp sharing opens `https://wa.me/?text=...` with `encodeURIComponent`; no phone number is needed.
- Share links use versioned `v1.<base64url>` data in the URL hash. The allowlist excludes name, phone, email, consumer number, address and coordinates. Inputs are validated with Zod; malformed/old links show a friendly error.
- Leads and proposal status records use Firestore only when Firebase is enabled and configured; otherwise they fall back to localStorage, with `src/data/seedLeads.json` demo leads.
- Responsive, keyboard-operable sharing controls, labels, privacy note and `aria-live` status messages.

## SRS proposal ID
The SRS does not provide a formal regex, but it explicitly gives `SOL-2026-0001` as its example. This implementation follows `SOL-YYYY-####` (sequence padded to at least four digits); e.g. `SOL-2026-0001`.

## Environment setup
Copy `.env.example` to `.env` and keep optional services disabled until configured.

### EmailJS
Set `VITE_ENABLE_EMAILJS=true`, `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID`, and `VITE_EMAILJS_PUBLIC_KEY`. Configure the EmailJS template's recipient to `{{to_email}}` and use these variables as needed: `to_name`, `phone`, `proposal_id`, `proposal_date`, `proposal_summary`, `system_kw`, `panel_count`, `net_cost`, `monthly_savings`, `payback_years`, `share_link`, `disclaimer`.

This implementation deliberately sends a summary and read-only plan link, not a PDF attachment. At the time of implementation, EmailJS's official pricing page lists Free as 200 monthly requests, 2 templates and requests up to 50 KB; attachments are not included in the Free plan's attachment allowance. EmailJS also documents a 1-request-per-second service rate limit. This app adds a stricter one-request-per-minute client-side cooldown, which is not a replacement for server-side abuse prevention.

### Firebase
Set `VITE_ENABLE_FIREBASE=true` and the public Firebase web config values. Firebase SDK is dynamically imported only when enabled and configured. Configure Firestore rules before using this with real leads. If Firebase is disabled, misconfigured or fails, data falls back to localStorage; this is a development fallback, not durable multi-device storage.

## Tests
- Added tests for ID format and 1,500-call uniqueness, versioned share encode/decode and invalid/tampered payloads, WhatsApp URL encoding, email validation/fallback/rate limiting, PDF content data, and accessible share UI.
- Manual sanity checks passed for ID formatting, 1,000 unique sequential IDs, and WhatsApp URL encoding.
- Full Vitest suite **not run**: `vitest` was not installed in the environment and `npm install --no-audit --no-fund` timed out. No full-suite pass is claimed.

## Known limitations / SRS notes
- The SRS example implies `SOL-YYYY-####`, but does not formally specify the ID grammar or how uniqueness should be coordinated across multiple browsers. The browser sequence is unique per stored browser profile; global cross-device uniqueness requires a backend/database transaction.
- The Phase 5 instruction specified 4–5 FAQs while SRS FR-AI-02 says 5–8. This implementation follows the confirmed Phase 5 behaviour (4–5 AI FAQs; automatic fallback supplies five).
- Installer contact details were not supplied, so the PDF explicitly says `Installer contact: Not configured in this demo.`
- Share links are readable Base64URL-encoded data, not encrypted or tamper-proof. They contain only recomputation inputs, not personal identifiers; validation catches malformed/outdated links but cannot stop someone from changing valid numeric inputs.
- The shareable link uses the hash approach even if Firebase is configured; storing plan payloads under short IDs is optional and not required for Phase 6.
