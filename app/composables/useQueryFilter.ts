/**
 * Starting value for a list filter, taken from the URL when it is one of the allowed
 * values. Lets other pages link straight to a filtered list, e.g. the dashboard's
 * "needs attention" items open /admin/fees?status=overdue.
 *
 *   const statusFilter = ref(queryFilter('status', ['pending', 'approved'] as const, ''));
 */
export function queryFilter<T extends string, F extends string>(key: string, allowed: readonly T[], fallback: F): T | F {
  const raw = useRoute().query[key];
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}
