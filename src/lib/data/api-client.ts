import { env } from "@/config/env";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
}

export async function apiFetch<T>(
  path: string,
  { method = "GET", body, signal }: RequestOptions = {},
): Promise<T> {
  const isFormData = body instanceof FormData;
  const response = await fetch(`${env.apiBasePath}${path}`, {
    method,
    // Let the browser set the multipart Content-Type (with boundary) for FormData bodies.
    headers: body !== undefined && !isFormData ? { "Content-Type": "application/json" } : undefined,
    body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const data = (await response.json()) as { message?: string | string[] };
      if (data.message) {
        message = Array.isArray(data.message) ? data.message.join(", ") : data.message;
      }
    } catch {
      // Non-JSON error body; keep the status message.
    }
    throw new ApiError(response.status, message);
  }

  // DELETE and some endpoints may return an empty body.
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

/** True for 2xx responses including 202 Accepted. */
export function isSuccessStatus(status: number): boolean {
  return status >= 200 && status < 300;
}
