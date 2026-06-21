import { backendUrl } from "./backendUrl";

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export async function apiFetch(path, options = {}) {
  const response = await fetch(`${backendUrl}${path}`, {
    ...options,
    credentials: "include",
  });

  const data = await response.json().catch(() => ({}));
  const status = response.status || data.status;

  if (status === 401 || data.status === 401) {
    window.dispatchEvent(new Event("auth:unauthorized"));
    throw new ApiError("Your session has expired.", 401, data);
  }

  if (response.ok === false) {
    throw new ApiError(
      data.message || "The request could not be completed.",
      status,
      data,
    );
  }

  return data;
}
