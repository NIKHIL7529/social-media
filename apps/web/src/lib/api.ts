export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

type ApiOptions = RequestInit & {
  skipUnauthorizedEvent?: boolean;
};

export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      credentials: "include",
      headers: {
        ...(options.body ? { "Content-Type": "application/json; charset=UTF-8" } : {}),
        ...options.headers,
      },
    });
  } catch (error) {
    throw new ApiError(
      `Unable to reach the API at ${API_URL}. Check that FastAPI is running and CORS allows this origin.`,
      0,
      error,
    );
  }

  const data = await response.json().catch(() => ({}));
  const status = response.status || data.status;

  if (status === 401 && !options.skipUnauthorizedEvent && typeof window !== "undefined") {
    window.dispatchEvent(new Event("auth:unauthorized"));
  }

  if (!response.ok) {
    throw new ApiError(data.message || data.detail || "The request could not be completed.", status, data);
  }

  return data as T;
}

export function jsonPost<TResponse, TBody>(path: string, body: TBody): Promise<TResponse> {
  return apiFetch<TResponse>(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
}
