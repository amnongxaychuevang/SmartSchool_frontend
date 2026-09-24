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
