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


type ApiOptions = RequestInit & {
  skipUnauthorizedEvent?: boolean;
};

export async function requestApi<T>(baseUrl: string, path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  const { headers: suppliedHeaders, ...requestOptions } = options;
  const headers = new Headers(suppliedHeaders);
  if (typeof options.body === "string" && !headers.has("Content-Type")) headers.set("Content-Type", "application/json; charset=UTF-8");

  try {
    response = await fetch(`${baseUrl}${path}`, {
      cache: "no-store",
      ...requestOptions,
      credentials: "include",
      headers,
    });
  } catch (error) {
    if (options.signal?.aborted) throw error;
    throw new ApiError(
      `Unable to reach the API. Check that FastAPI is running and the API URL is configured correctly.`,
      0,
      error,
    );
  }

  const status = response.status;

  const data = await response.json().catch(() => {
    throw new ApiError(`The API returned an invalid response (HTTP ${status}). Please try again.`, status, null);
  });
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new ApiError(`The API returned an invalid response (HTTP ${status}).`, status, data);

  if (!response.ok) {
    const detail = Array.isArray(data.detail)
      ? data.detail.map((issue: { msg?: string }) => issue.msg?.replace(/^Value error, /, "")).filter(Boolean).join("; ")
      : data.detail;
    throw new ApiError(data.message || detail || "The request could not be completed.", status, data);
  }

  return data as T;
}

export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { skipUnauthorizedEvent, ...requestOptions } = options;
  try {
    return await requestApi<T>("", path, requestOptions);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401 && !skipUnauthorizedEvent) {
      window.dispatchEvent(new Event("auth:unauthorized"));
    }
    throw error;
  }
}

export function jsonPost<TResponse, TBody>(path: string, body: TBody, signal?: AbortSignal): Promise<TResponse> {
  return apiFetch<TResponse>(path, {
    method: "POST",
    body: JSON.stringify(body),
    signal,
  });
}
