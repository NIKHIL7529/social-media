export function getApiOrigin(): string {
  const value = process.env.API_INTERNAL_URL || "http://localhost:8000";
  const url = new URL(value);
  if (!/^https?:$/.test(url.protocol) || url.username || url.password || url.search || url.hash || url.pathname !== "/") {
    throw new Error("API_INTERNAL_URL must be an absolute HTTP(S) origin, without credentials, a path, or query parameters.");
  }
  return url.origin;
}
