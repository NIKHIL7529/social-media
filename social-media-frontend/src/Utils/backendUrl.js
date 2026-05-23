const configuredBackendUrl = import.meta.env.VITE_BACKEND_URL?.trim();

export const backendUrl = (configuredBackendUrl || "http://localhost:8000").replace(
  /\/$/,
  ""
);
