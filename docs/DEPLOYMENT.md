# Deployment Guide

Use the step-by-step instructions in `README.md` → **Vercel deployment**. In brief: push the repository to GitHub, import it into Vercel as a Vite project, set public `VITE_*` variables only for enabled browser integrations, and set `AI_PROVIDER_API_KEY` as a server-only Vercel secret. Build command is `npm run build`; output directory is `dist`.

`vercel.json` contains the SPA rewrite needed for `/results`, `/shared`, and `/admin/*` refreshes and the baseline security headers. Before production, test these routes in a deployed preview and confirm `/api/ai` is served by the serverless function rather than the SPA rewrite.

Google Cloud key restriction: set **Application restrictions → Websites (HTTP referrers)** to exact `localhost` development origin and deployed Vercel/custom domains; restrict **API restrictions** to only the Maps APIs actually used. Do not leave a browser key unrestricted.

No Vercel deployment was performed from this environment.
