import { ref } from 'vue';
import { useApiClient } from '../infrastructure/api/apiClient';
import { useDialog } from './useDialog';
import { getErrorMessage } from '../utils/errors';

// An error response to a blob request arrives as a Blob; read its JSON message.
async function blobError(err: unknown): Promise<string> {
  const data = (err as { data?: unknown })?.data;
  if (data instanceof Blob) {
    try {
      const body = JSON.parse(await data.text());
      if (body?.message) return body.message;
    } catch { /* not JSON */ }
  }
  return getErrorMessage(err);
}

/**
 * The standard list export: the backend builds the .xlsx (GET /<resource>/export,
 * same filters as the list, audit-logged) and the browser saves it.
 */
export function useServerExport() {
  const api = useApiClient();
  const { locale } = useI18n();
  const dialog = useDialog();
  const exporting = ref(false);

  const download = async (path: string, filters: Record<string, string | number | null | undefined>, fileBase: string) => {
    exporting.value = true;
    try {
      const query = new URLSearchParams({ lang: locale.value });
      for (const [k, v] of Object.entries(filters)) if (v !== '' && v != null) query.set(k, String(v));
      const blob = await api<Blob>(`${path}?${query}`, { responseType: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileBase}-${new Date().toLocaleDateString('en-CA')}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      dialog.error(await blobError(err));
    } finally {
      exporting.value = false;
    }
  };

  return { exporting, download };
}
