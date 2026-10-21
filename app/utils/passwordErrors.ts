import { getErrorMessage } from './errors';

// The API's password/reset messages → i18n keys, so they read in the user's language.
const PASSWORD_ERRORS: Record<string, string> = {
  'Current password is incorrect': 'password.err_current',
  'The new password must be different': 'password.err_same',
  'The code is wrong or has expired': 'password.err_code',
  'Too many codes requested. Try again in an hour.': 'password.err_too_many_codes',
  'The code could not be sent. Please ask the school office to reset your password.': 'password.err_not_sent',
  'Too many attempts, please try again later': 'password.err_rate_limited',
  'Too many login attempts, please try again later': 'password.err_rate_limited',
};

export function passwordErrorMessage(err: unknown, t: (key: string) => string): string {
  const message = getErrorMessage(err, t('common.error'));
  const key = PASSWORD_ERRORS[message];
  return key ? t(key) : message;
}
