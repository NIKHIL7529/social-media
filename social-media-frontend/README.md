# Social Media Frontend

This frontend now uses Vite instead of Create React App and is ready for Vercel deployment.

## Available Scripts

In the project directory, you can run:

### `npm run dev`

Starts the Vite development server.

### `npm start`

Alias for `npm run dev`.

### `npm test`

Runs Vitest once.

### `npm run build`

Builds the app for production to the `dist` folder.

### `npm run preview`

Serves the production build locally.

## Environment

Create a `.env.local` file and set:

```bash
VITE_BACKEND_URL=https://your-backend-url
```

If `VITE_BACKEND_URL` is not set, the app falls back to the current Render backend at `https://social-media-backend-d246.onrender.com`.

## Vercel

`vercel.json` includes an SPA rewrite so client-side routes work after deployment.

Deploy the frontend to Vercel and keep the backend deployed separately on Render.

Set `VITE_BACKEND_URL` in the Vercel project environment variables before deploying.
