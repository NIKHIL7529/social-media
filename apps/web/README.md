# SocialSphere web

Next.js 16 App Router frontend with React 19, TypeScript, Tailwind CSS, TanStack Query, Lucide icons, and react-hot-toast. Dependency versions and commands are defined in `package.json`.

## Local setup

Use Node.js 24.18.0 or newer and npm 11 or newer. Run from `apps/web`:

```powershell
Copy-Item .env.example .env.local
npm install
npm run dev
```

Set `NEXT_PUBLIC_API_URL` in `.env.local` to the API's absolute HTTP(S) origin, such as `http://localhost:8000`. Do not include an API path, credentials, or query parameters. Open `http://localhost:3000`.

## Vercel deployment

Set the project root to `apps/web` and configure `NEXT_PUBLIC_API_URL` with the Render API origin. The value is used by Next.js rewrites, server requests, and the browser's WebSocket URL. Redeploy after changing it; do not introduce a second API-origin variable.

Browser HTTP calls use same-origin `/api` paths rewritten to FastAPI. The browser connects directly to the configured API for chat WebSockets; authentication details belong to the [API README](../api/README.md#authentication-and-realtime).

## Validation and production preview

```powershell
npm run lint
npm run typecheck
npm run build
npm run start
```

`start` serves the production build. The optional container build uses `NEXT_BUILD_TARGET=standalone`; this is not needed on Vercel.

## Code organization and data flow

- `src/app`: route entry points, metadata, layouts, and loading/error boundaries.
- `src/features`: domain screens, hooks, and API services.
- `src/components`: reusable UI; `src/lib`: shared infrastructure; `src/types`: shared types.
- Use server components for route composition and focused client components for state, forms, browser APIs, and subscriptions. Use `next/link` for links and `next/navigation` for programmatic transitions.
- The social layout prefetches the account; the posts page prefetches the first feed page. A request-scoped query client and hydration boundaries transfer data to the browser without sharing private caches across users.
- Signup renders per request so its birth-date picker receives the current cutoff. Login is static. Form validation is shared where applicable; the API enforces account rules independently.
- HTTP requests use `no-store`; TanStack Query provides a 30-second default freshness window and deduplicates queries. Forward cancellation signals through services. Validation/authentication failures are not retried automatically.
- Comments and liker dialogs load on demand. The desktop activity rail reuses account data. Keep errors visible, with recovery actions, and use component-shaped skeletons.
- Cloudinary's custom image loader requests resized images. The first feed image loads eagerly; subsequent images load lazily.

## Shared UI

Colors, typography, surfaces, focus states, and the 4px corner radius live in `src/app/globals.css` and `tailwind.config.ts`. Plus Jakarta Sans is self-hosted with `next/font/local`; its license sits beside the font asset.

Light appearance uses white/lavender surfaces. Dark appearance uses charcoal surfaces and violet-to-pink action gradients. Branding includes violet, pink, and orange; cyan provides secondary highlights. System appearance follows the device. Toasts use the same theme tokens. Keep the logo square and avatars circular.

Desktop navigation lives in the sidebar; smaller screens use a header and bottom tabs. Appearance and logout controls belong to Settings. The desktop activity rail stays centered and has no internal scrolling.

Use `PostList` for single-column posts. On small screens, home-feed posts extend to the screen edges and images use their natural aspect ratio to determine height. Desktop post width fits the available viewport height. Headers, actions, and comments share the image width; expanded content may grow vertically.

Authentication uses a CSS/SVG backdrop and glossy forms with single-column fields. Fit controls to the available screen without hiding content. The signup photo picker is circular and scales down on short screens. Respect reduced-motion preferences.
