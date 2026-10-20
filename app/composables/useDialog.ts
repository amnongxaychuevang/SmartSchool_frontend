import { shallowReactive } from 'vue';
import { getErrorMessage } from '../utils/errors';

export type DialogType = 'success' | 'error' | 'warning' | 'info' | 'confirm';

export interface ConfirmOptions {
  message: string;
  title?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'primary' | 'danger';
  /** Runs inside the dialog: shows a spinner, and on failure keeps it open with the error. */
  onConfirm?: () => Promise<unknown>;
}

interface DialogState extends ConfirmOptions {
  open: boolean;
  type: DialogType;
  busy: boolean;
  error: string;
  resolve: ((ok: boolean) => void) | null;
}

// One dialog for the whole app, rendered by <AppDialog> in app.vue. Module-level
// state is fine: it is only ever opened by client-side user actions.
const state = shallowReactive<DialogState>({
  open: false, type: 'info', message: '', busy: false, error: '', resolve: null,
});

function show(type: DialogType, options: ConfirmOptions): Promise<boolean> {
  state.resolve?.(false);
  return new Promise((resolve) => {
    Object.assign(state, {
      title: undefined, confirmLabel: undefined, cancelLabel: undefined, tone: undefined, onConfirm: undefined,
      ...options, type, open: true, busy: false, error: '', resolve,
    });
  });
}

function close(ok: boolean) {
  if (state.busy) return;
  state.open = false;
  const resolve = state.resolve;
  state.resolve = null;
  resolve?.(ok);
}

async function accept() {
  if (!state.onConfirm) return close(true);
  state.busy = true;
  state.error = '';
  try {
    await state.onConfirm();
    state.busy = false;
    close(true);
  } catch (err) {
    state.error = getErrorMessage(err);
    state.busy = false;
  }
}

const alertFn = (type: DialogType) => (message: string, title?: string) =>
  show(type, { message, title }).then(() => undefined);

export function useDialog() {
  return {
    success: alertFn('success'),
    error: alertFn('error'),
    warning: alertFn('warning'),
    info: alertFn('info'),
    confirm: (options: ConfirmOptions) => show('confirm', options),
  };
}

/** Internal: only <AppDialog> should use this. */
export function useDialogState() {
  return { state, accept, cancel: () => close(false) };
}
