# Security and Privacy Review

## Scan performed

- Searched the extracted project text/source for common API-key patterns and hard-coded credential assignments. No live key pattern was found in the checked working tree. The search also finds the documented demo password variable and the server proxy's `AI_PROVIDER_API_KEY` name; neither is a value.
- `.gitignore` ignores `.env` and `.env.*`, while re-including `.env.example`.
- The provided archive does not contain a `.git` directory, so **git history could not be scanned**. Before pushing, run `git log -p --all -- .env`, `git grep -nE 'AIza[0-9A-Za-z_-]{20,}|sk-[A-Za-z0-9]{20,}' $(git rev-list --all)` only if appropriate for your repo, and preferably a dedicated secret scanner. If a secret was ever committed, revoke/rotate it; deleting it from the latest commit is insufficient.
- `.env.example` documents every current Vite setting and the server-only AI proxy settings.

## Header rationale (`vercel.json`)

- `Content-Security-Policy`: limits scripts to same-origin plus Google Maps hosts, limits connections to the configured EmailJS, Firebase and Google endpoints, blocks objects, and restricts framing. Review allowlists whenever integrations change. `style-src 'unsafe-inline'` remains to accommodate runtime style attributes; avoid adding `script-src 'unsafe-inline'` or `unsafe-eval`.
- `X-Content-Type-Options: nosniff`: prevents browsers from guessing a different content type.
- `Referrer-Policy: strict-origin-when-cross-origin`: reduces full URL/referrer leakage to external sites while retaining origin information cross-site.
- `Permissions-Policy`: disables camera/microphone and allows geolocation only for same-origin. Change only if a real Maps implementation needs it.
- SPA rewrite sends client routes to `index.html`; Vercel serverless routes such as `/api/ai` should continue to resolve as functions.

## Important limits

- `VITE_*` values are public. Google Maps browser keys and Firebase web config are expected to be visible; restrict APIs/referrers and enforce database rules.
- `VITE_ADMIN_DEMO_PASSWORD` is client-side and **not a security control**. Use Firebase Auth plus admin custom claims for production.
- AI provider key must remain a Vercel server environment secret, not a Vite variable. The example proxy needs production rate limiting, authentication/abuse protection, size limits and monitoring before public exposure.
- EmailJS keys are public; constrain allowed origins, template recipients and quota.
- Firebase Firestore rules must be deployed and tested against an actual project. Admin custom claims must be assigned by trusted server-side code.
- No real external API calls were verified because no production credentials or deployed environment were provided.
