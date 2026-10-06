# Cloudflare preview setup

On 2026-10-06 the Cloudflare GitHub connection was established and the separate Worker `aervyntai-preview` was created. Its production build branch is `feat/aervynt-production-website`; the build command is `pnpm build:cloudflare` and deployment command is `pnpm deploy:cloudflare`.

Build variable: `NEXT_PUBLIC_SITE_URL=https://aervyntai-preview.vshnypko.workers.dev`.

The initial main-branch build had no package.json because main contains only a seed README. This commit starts a build of the feature branch. Live website form delivery must still be verified before production promotion.
