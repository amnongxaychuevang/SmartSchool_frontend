/**
 * Turns a stored file path (e.g. "/uploads/slips/x.webp") into a URL on the API
 * host, which serves uploads outside /api. Absolute http(s), blob: and data:
 * URLs pass through; anything else (e.g. "javascript:") gives null so it is
 * never rendered as a link or image.
 */
export function useMediaUrl() {
  const apiBase = useRuntimeConfig().public.apiBaseUrl as string;
  return (path?: string | null): string | null => {
    if (!path) return null;
    if (/^(https?:|blob:|data:image\/)/i.test(path)) return path;
    if (!path.startsWith('/')) return null;
    return new URL(path, apiBase).href;
  };
}
