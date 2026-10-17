# Phase 5 — Optional AI layer

## Browser configuration
Set `VITE_ENABLE_AI=true` and `VITE_AI_PROXY_URL=/api/ai` to enable the optional proxy. Leave either unset/empty to use local template text with no network request. The browser never reads provider credentials.

## Vercel proxy example
`api/ai.js` is a minimal serverless example. In Vercel Project Settings → Environment Variables, configure `AI_PROVIDER_API_KEY` (and optionally `AI_PROVIDER_URL`, `AI_MODEL`). These are server-side variables and must not use the `VITE_` prefix. Deploy the API route and set the frontend proxy URL to `/api/ai`. Add authentication/rate limits and provider-specific schema validation before public production use.

## Data privacy and deterministic calculations
Only a reduced computed-plan object is sent to the proxy. Wizard contact fields, consumer number, name, phone and exact address are not included. AI output does not feed back into the calculation engine. Summary numbers are checked against computed-plan values; invalid FAQ structures and failed requests fall back to local templates.

## Test commands
`npm install`, `npm test`, `npm run build`. In this environment, `npm install --no-audit --no-fund` timed out, so tests/build could not be executed here; tests have been added and are not represented as passing.
