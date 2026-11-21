/**
 * The server's API (SPEC §3.4): JSON in, JSON out, and every refusal `{ error, code }`. A request
 * that never reached the server (offline, the PC asleep) is an `ApiError` with code `offline`.
 */

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details: Readonly<Record<string, unknown>> = {},
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** A fetch, injected so a test passes its own. */
export type Fetch = (input: string, init?: RequestInit) => Promise<Response>;

let fetcher: Fetch = (input, init) => fetch(input, init);

/** For the tests: the fetch every call goes through. */
export function setFetch(next: Fetch): void {
  fetcher = next;
}

/** A call to `/api/<path>`. A body is sent as JSON; none, and no content type is sent either. */
export async function api<T>(method: "GET" | "POST" | "PUT" | "DELETE", path: string, body?: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetcher(`/api/${path}`, {
      method,
      cache: "no-store",
      ...(body === undefined ? {} : { headers: { "content-type": "application/json" }, body: JSON.stringify(body) }),
    });
  } catch {
    throw new ApiError(0, "offline", "The server can't be reached.");
  }
  const text = await response.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // Not JSON: a proxy's error page while the server restarts.
  }
  if (!response.ok) {
    const { error, code, ...details } = (data ?? {}) as { error?: string; code?: string };
    // A gateway's own error (the server down behind the dev proxy) is the server being out of reach.
    const unreachable = !code && response.status >= 502 && response.status <= 504;
    throw new ApiError(
      response.status,
      code ?? (unreachable ? "offline" : "server_error"),
      error ?? (unreachable ? "The server can't be reached." : `The server answered ${response.status}.`),
      details,
    );
  }
  return data as T;
}
