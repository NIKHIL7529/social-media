# SocialSphere web

Next.js App Router frontend using React, Tailwind CSS, and TanStack Query. Follow the [shared development conventions](../README.md).

## Setup and validation

Use Node.js 24.18.0 or newer and npm 11 or newer. Run commands from `apps/web`. Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

```powershell
npm install
npm run dev
```

Open `http://localhost:3000`; the API must allow this origin. Validate and run a production build with:

```powershell
npm run lint
npm run typecheck
npm run build
npm run start
```

Local builds use `next build` and `next start`. Docker sets `NEXT_BUILD_TARGET=standalone`, copies the generated server, public assets, and static chunks, and runs `node server.js`.

Browser HTTP requests use same-origin `/api` paths, rewritten to FastAPI. Set `NEXT_PUBLIC_API_URL` to your Render API origin in Vercel's Production environment before deploying, then redeploy after changes. Server prefetches use that origin too; `API_INTERNAL_URL` is an optional server-only address for a private network. Cookie authentication stays on the web application's hostname.

Live chat connects directly to Render's `/ws/chat` endpoint using a 60-second, purpose-limited ticket obtained through the authenticated HTTP proxy. The main session cookie stays HTTP-only. Deploy the API and web changes together. On Render, set `FRONTEND_URL` to the Vercel site and use `ENVIRONMENT=production`. No Docker setup is required for this deployment.

## Rendering and data

- `src/app` owns server entry points, metadata, layouts, and loading/error boundaries. Await dynamic route parameters and pass plain values into interactive features.
- `src/features` owns domain UI, query hooks, and services; `src/components` owns reusable presentation, `src/lib` shared infrastructure, and `src/types` shared types.
- Keep browser APIs, forms, state, and event handlers in focused client components. Persistent social and chat layouts preserve navigation and the chat connection across child routes.
- Use `next/link` for navigation and `next/navigation` for transitions following authentication, mutations, or resolved lookups. Post authors link to user IDs; name lookup supports follower/following lists.
- The social server layout prefetches the current account using its token cookie; the posts page prefetches the first feed page. TanStack Query's `HydrationBoundary` transfers those snapshots into the browser cache. Query configuration is shared, and the server query client is scoped to one request through React `cache`. Auth pages remain statically rendered.
- API transport shares parsing and error handling between server and browser requests. Requests use `no-store`; TanStack Query owns freshness and deduplication. Never share personalized responses across server requests. Failed prefetches remain eligible for browser fetching and the existing visible error/retry UI.
- Pass cancellation signals through services to `apiFetch` and `jsonPost`. Do not automatically retry validation or authentication failures. Comments, liker lists, and group-member queries load when their controls open. The desktop activity panel uses cached account data.
- Match skeletons to page components. Keep errors visible alongside cached content and provide recovery actions. Lazy-load optional dialogs and comments.
- Use memoization when reference stability matters to an effect or subscription. Import local components directly.

## UI conventions

Shared colors, typography, focus styles, and theme surfaces live in the global stylesheet and Tailwind configuration. The font is self-hosted through `next/font/local`, with its license beside the asset. System appearance follows the operating system; explicit light/dark choices override it.

Desktop branding and navigation live in the sidebar; smaller screens use the header and bottom tabs. Appearance and logout controls live in Settings. Keep the desktop activity panel centered and visible without internal scrolling.

Feeds, saved posts, and profile posts use `PostList` in one column. Image ratio and available viewport determine post width; headers, actions, and comments share that width. Preserve image proportions without cropping or fixed post widths. The first image loads eagerly; subsequent images load lazily. Expanded content can grow vertically.

Use restrained, theme-aware surfaces. Reserve translucent blur for sticky navigation and overlays, with glossy authentication forms. Respect reduced-motion preferences and responsive layouts.

Cold development compilation differs from production navigation performance; assess warm navigation and production behavior separately. Do not bypass lint or type checking to pass a build.

References: [server/client components](https://nextjs.org/docs/app/getting-started/server-and-client-components), [navigation](https://nextjs.org/docs/app/getting-started/linking-and-navigating), and [images](https://nextjs.org/docs/app/api-reference/components/image).
