# Phase 7 — Admin dashboard

## Run
```bash
npm install
cp .env.example .env.local
# Set VITE_ADMIN_DEMO_PASSWORD to a local demo password (never commit .env.local)
npm run dev
npm test
npm run build
```

Open `/admin` and enter the configured demo password. If `VITE_ENABLE_FIREBASE` is not exactly `true` or Firebase configuration is incomplete, the dashboard loads the five seed leads from `src/data/seedLeads.json`, persists edits in browser localStorage, and does not require Firebase.

## Important demo-login security limits
`VITE_ADMIN_DEMO_PASSWORD` is a Vite client-side environment variable. Its value is bundled into browser code and can be inspected by anyone with access to the site; browser storage/session state can also be edited. The 30-minute session timeout is a UX guard, not a security boundary. This password-only mode is strictly for local demos and must not protect real customer data or production routes. Use Firebase Authentication plus server-side authorization for production.

When Firebase is enabled, configure Firebase Auth email/password users and assign the trusted admin custom claim `admin: true` from a secure Admin SDK environment. Do not let a client assign its own claim. `firestore.rules` checks `request.auth.token.admin == true` for lead/proposal reads and writes. If no custom admin claim is present, Firestore access is denied. Protect all other private collections with equivalent rules.

## Data interface
`src/services/leads.js` provides `listLeads`, `getLead`, `upsertLead`, `updateLead`, `addLeadNote`, and `deleteLead`. It uses Firestore when enabled and fully configured; when Firebase is disabled or incomplete, it uses the five seed leads and browser localStorage. If a configured Firestore request is denied or fails, the admin UI surfaces the error rather than pretending the remote change succeeded. Seed data is fictional. Each lead carries clientId, status, notes, assignedTo, revenueEstimate, updatedAt, plan inputs/results, contact consent, and status history.

## Status transitions
- Lead → Survey Done or Closed Lost
- Survey Done → Proposal Sent or Closed Lost
- Proposal Sent → Approved or Closed Lost
- Approved → Installed or Closed Lost
- Installed is terminal
- Closed Lost → Lead (re-open)

Transitions are enforced by the pure `transitionLeadStatus` utility. Each change appends status history and updates `updatedAt`.

## Revenue and CSV
Revenue estimate sums the stored `netCost` from leads in Approved or Installed status only. It does not recalculate a solar plan. CSV columns: Client ID, Name, Email, Phone, City, State, Status, System kW, Net cost (INR), Revenue estimate (INR), Assigned to, Created at, Updated at, Notes. Export includes a UTF-8 BOM, RFC-style quoting, and formula-injection neutralization.

## Privacy
Lead details are kept for follow-up on consented proposal requests, proposal administration, and pipeline reporting. The Delete lead action deletes the lead record and its embedded notes from the active store. Production retention/deletion requirements should also cover backups, exports, analytics, and audit logs.

## Re-send proposal
When EmailJS is configured, the detail page exposes a re-send proposal summary action and reuses `src/services/email.js`. It sends a summary and a link back to the results page (not a PDF attachment). Consent must be recorded; the Phase 6 email cooldown still applies. If EmailJS is disabled, the re-send action is hidden and the PDF can still be downloaded.

### Firebase lead-intake caveat

The rules intentionally allow only admins to write the `leads` collection, as requested. That means the public Phase 6 proposal-email flow cannot directly persist a new lead to Firestore from an unauthenticated browser; it falls back to local storage. For production, add a server-side/Cloud Function lead-intake endpoint that validates consent and writes a minimal record without granting public clients direct lead-write access. This is an SRS integration tension between public lead capture and admin-only Firestore writes.
