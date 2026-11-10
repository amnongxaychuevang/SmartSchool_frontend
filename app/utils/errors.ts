// True when the request never got an HTTP response: server down, CORS blocked,
// offline. $fetch reports these as a FetchError with no `response`/`status`.
// Wrapped errors (new Error(msg, { cause })) are unwrapped first.
export function isNetworkError(err: unknown): boolean {
  let e = err as { cause?: unknown; response?: unknown; statusCode?: unknown; name?: unknown; message?: unknown } | null;
  for (let i = 0; e && typeof e === 'object' && i < 5; i++) {
    if (e.name === 'FetchError' && !e.response && !e.statusCode) return true;
    if (typeof e.message === 'string' && /failed to fetch|networkerror|load failed|<no response>/i.test(e.message) && !e.response) return true;
    e = e.cause as typeof e;
  }
  return false;
}

// Turns anything thrown (a $fetch FetchError, an Error, a string, ...) into a
// user-facing message. $fetch errors carry the API's `{ message }` body in `data`.
export function getErrorMessage(err: unknown, fallback = 'An error occurred'): string {
  if (err && typeof err === 'object') {
    const e = err as { data?: { message?: unknown }; response?: { _data?: { message?: unknown } }; message?: unknown };
    const apiMessage = e.data?.message ?? e.response?._data?.message;
    if (typeof apiMessage === 'string' && apiMessage) return apiMessage;
    if (typeof e.message === 'string' && e.message) return e.message;
  }
  if (typeof err === 'string' && err) return err;
  return fallback;
}
