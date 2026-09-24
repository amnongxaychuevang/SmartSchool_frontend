import { describe, it, expect } from 'vitest';
import { getErrorMessage } from './errors';

describe('getErrorMessage', () => {
  it('prefers the API message carried by a $fetch error', () => {
    const fetchError = Object.assign(new Error('[PUT] "/api/x": 409 Conflict'), { data: { message: 'Request is not pending' } });
    expect(getErrorMessage(fetchError)).toBe('Request is not pending');
  });

  it('reads response._data.message too', () => {
    expect(getErrorMessage({ response: { _data: { message: 'Invalid credentials' } } })).toBe('Invalid credentials');
  });

  it('falls back to Error.message, then a string, then the fallback', () => {
    expect(getErrorMessage(new Error('boom'))).toBe('boom');
    expect(getErrorMessage('plain')).toBe('plain');
    expect(getErrorMessage(null, 'Failed to save')).toBe('Failed to save');
    expect(getErrorMessage({}, 'Failed to save')).toBe('Failed to save');
  });
});
