const configuredBackendUrl = import.meta.env.VITE_BACKEND_URL?.trim();

export const backendUrl = (
  configuredBackendUrl || "https://social-media-backend-d246.onrender.com"
).replace(/\/$/, "");
