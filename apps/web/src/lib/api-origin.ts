export function getApiOrigin(): string {
  const value = process.env.NEXT_PUBLIC_API_URL;
  if (!value) throw new Error("Set NEXT_PUBLIC_API_URL to the FastAPI origin (your Render URL in production).");
  const url = new URL(value);
  if (!/^https?:$/.test(url.protocol) || url.username || url.password || url.search || url.hash || url.pathname !== "/") {
    throw new Error("The API URL must be an absolute HTTP(S) origin, without credentials, a path, or query parameters.");
  }
  return url.origin;
}
