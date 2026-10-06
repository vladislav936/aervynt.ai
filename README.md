# AERVYNT AI

Premium responsive B2B website for **Physical Infrastructure for the AI Era**. Built with Next.js App Router, TypeScript, React and shared CSS design tokens. No external fonts, tracking, manufacturer logos, asserted dealership relationships or public enterprise prices.

## Run and verify

Use Node.js 24 LTS and pnpm 11.19.0 (the pinned package manager).

```sh
corepack enable
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm dev
pnpm lint
pnpm typecheck
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
```

Production is `pnpm build` followed by `pnpm start`. Playwright runs against the production server at localhost:3000; stop other servers on that port before testing. Tests cover every content route at desktop/mobile sizes, navigation, accessibility, enquiry validation and truthful delivery failure. GitHub Actions runs the same checks.

## Deploy to Vercel

1. Import `vladislav936/aervynt.ai`, select Next.js and repository root. Use the feature branch for a preview first. Do not promote or merge until reviewed.
2. Set `NEXT_PUBLIC_SITE_URL` to the exact deployment origin, without a trailing slash. Use the production domain for production and each preview's exact URL for preview environments. Rebuild after changing it: metadata is generated at build time and the lead endpoint enforces same-origin submissions.
3. Set server-only `LEAD_WEBHOOK_URL` and `LEAD_WEBHOOK_TOKEN`. Never prefix secrets with `NEXT_PUBLIC_`.
4. Review all routes and submit a controlled test enquiry through the configured receiver. Check reception before promotion.
5. Configure `aervynt.ai` DNS through the deployment provider and enable HTTPS. This repository does not alter DNS or publish production automatically.

`vercel.json` supplies deterministic install/build commands. Alternatively deploy to a Node.js host using `pnpm build && pnpm start`. Keep `.next`, `public`, `package.json` and installed runtime dependencies together on a Node.js host. This is a server-backed site, not a static export.

## Lead delivery contract and launch requirements

`POST /api/leads` validates enumerated interests, lengths, email and explicit consent with Zod. It enforces the configured origin, rejects oversized JSON, uses a hidden spam field and never logs enquiry contents. The server forwards validated fields plus `source` and `submittedAt` as JSON to the configured HTTPS webhook with `Authorization: Bearer <token>`. A non-2xx response, redirect or timeout returns an error; the UI never claims delivery without receiver acknowledgement. The receiver must durably store an enquiry before returning 2xx, deduplicate retries, control access, set retention and implement rate limiting/abuse detection. Add deployment-provider rate limiting on `/api/leads` before enabling public enquiries; do not rely on in-memory counters across serverless instances.

Without both webhook values the endpoint returns 503 and the form displays an honest unavailable message. Configure a CRM integration or your own durable enquiry receiver; this project does not send email or register marketing subscriptions. Confirm the legal operating entity, direct privacy contact, retention period and processors in `src/app/privacy/page.tsx` before enabling collection. The owner confirmed Litehouse Alfa General Trading LLC, Dubai, UAE and vladislav@aervynt.ai; the privacy notice identifies Cloudflare and HubSpot.

Public-launch checklist: verify legal/company copy, privacy details, receiver persistence and rate limits; confirm any product specifications and territory rights; test demo/quote/audit/partner enquiries; review mobile keyboard navigation; configure exact canonical origin and HTTPS. Capability pages are catalog foundations, not inventory, certification or partner claims.

## Architecture and content

- `src/app/page.tsx`: home.
- `src/app/[slug]/page.tsx`: Robotics, AI Infrastructure/Liquid Cooling, Industries, RaaS, Technology Partners, Company and Autonomous Data Center Operations.
- `src/app/robotics/[category]/page.tsx`: seven prerendered capability categories.
- `src/lib/content.ts`: typed category, sector, commercial and page content.
- `src/components`: shared navigation, CTAs, engineering illustration and enquiry form.
- `src/app/api/leads/route.ts`: server-only lead delivery.
- `src/app/globals.css`: responsive layout, tokens and reduced-motion support.
- `src/app/sitemap.ts`, `robots.ts`, route metadata and custom icon: SEO foundation.

The infrastructure and humanoid graphics are original CSS illustrations, labelled as conceptual architecture. Technology Partners is an invitation and capability map; add verified relationships only after written authorization. No performance guarantees, invented clients, office locations or prices are published.


## Direct HubSpot form integration

A direct Forms API adapter is available without Make/n8n. The connected portal contains the published form **AERVYNT — Contact & Assessment Request** (portal `247218560`, form GUID `658e0c50-acd7-42d2-b0dd-52917cd88852`). Connector CRM access does not provide a website runtime credential or form-editor settings.

To activate:

1. Open the existing form in HubSpot and verify its internal property names. The signed-in editor confirmed `email` and multiline `message`; firstname, lastname and phone are optional, and there is no company or full-name field. The provided mapping submits email plus message and retains the unmodified full name and company inside the enquiry. All submitted properties must belong to the published form; fill any other required fields or remove their requirement before activating this integration.
2. Set `HUBSPOT_FIELD_MAP` to a JSON object with required keys `email` and `enquiry`, each mapped to its verified internal property name. Do not use UI labels. The verified mapping in `.env.example` is `{"email":"email","enquiry":"message"}`. Optional `name` and `company` mappings are supported only for forms that actually contain suitable properties.
3. Set `LEAD_PROVIDER=hubspot`, `HUBSPOT_PORTAL_ID`, `HUBSPOT_FORM_ID` and the exact `NEXT_PUBLIC_SITE_URL` on the host; rebuild/redeploy the reviewed branch. The webhook credentials are not used in this mode. Missing/invalid mappings return 503 and failed HubSpot submissions return 502, with no automatic fallback or fabricated success.
4. Enable form submission notifications for the active HubSpot user with address `vladislav@aervynt.ai`. The connected user's email is different; a user search did not find this notification address. This recipient must be an active HubSpot user with email notifications enabled. User invitations/account-email changes are not performed by the code.
5. Submit a controlled test after activation and verify both the HubSpot form submission and actual email receipt. No test lead or email has been sent to the live portal by the repository tests.

The detailed enquiry includes intent, commercial model, region, industry, category and message, so repeated enquiries remain separate form submissions. It sends explicit processing consent and **no marketing subscription consent**. The adapter does not install HubSpot tracking scripts, read visitor cookies or infer names. Native HubSpot submission notifications handle email separately: an accepted API submission alone is not proof of email delivery.

Form fields, notification recipient, legal operator and live preview delivery have been verified. The owner confirmed receipt of the preview email. Existing provider-level rate limiting requirements still apply. Tests use a stub transport and fixture property names, never the live CRM.


## Cloudflare Workers preview

The repository's new Next.js website is separate from the earlier static-only Worker `aervyntai`. Use the feature branch for the preview Worker `aervyntai-preview`; do not connect the static production Worker to a build of `main` (main currently contains only the initialization README).

The OpenNext adapter builds a server-backed Worker with `/api/leads`. Run `pnpm build:cloudflare` then `pnpm preview:cloudflare` to verify it in the Workers runtime. `pnpm deploy:cloudflare` deploys the built output to the preview Worker named in `wrangler.jsonc`.

For Cloudflare Git builds select `feat/aervynt-production-website`, repository root, build command `pnpm build:cloudflare`, deploy command `pnpm deploy:cloudflare`, and set the build variable `NEXT_PUBLIC_SITE_URL=https://aervyntai-preview.vshnypko.workers.dev`. The runtime configuration includes the verified non-secret HubSpot portal/form identifiers and property mapping. No CRM access token is needed for this Forms endpoint. Verify receipt from this preview before production promotion.

HubSpot notification setup was completed on 2026-10-05: `vladislav@aervynt.ai` is active and selected in the published form. A controlled hosted-form submission was recorded in HubSpot and the user confirmed actual email receipt. This verifies HubSpot notifications; it does not yet verify the new website's deployed `/api/leads` route.

Before switching to production, review the preview, configure the legal/privacy details, provider rate limits, and exact production origin at build and runtime. Change Worker name and self-reference together only for a reviewed production deployment. Existing `aervyntai` custom domains remain attached to the earlier static site until a deliberate production update.
## Production deployment

Keep preview on default `wrangler.jsonc`; production uses `wrangler.production.jsonc` and existing Worker `aervyntai`.
Cloudflare Builds: branch `main`, root `/`, build `pnpm build:production`, deploy `pnpm deploy:production`; build variable `NEXT_PUBLIC_SITE_URL=https://aervynt.ai`.
Production runtime supplies verified HubSpot configuration, both root/www accepted origins and a Cloudflare rate limiter (5 requests per IP per minute per location, namespace 247218560). This is best-effort abuse protection, not an exact global quota. Missing limiter fails closed. Other platforms should supply their own protection and leave `LEAD_RATE_LIMIT_ENABLED` unset.
Require CI and preview checks before merging. Verify root/www and one controlled form submission after deployment.
Rollback: Cloudflare > aervyntai > Deployments > previous version > Roll back. Previous static version: `8423261b` (short ID).
