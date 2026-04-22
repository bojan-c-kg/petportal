import { describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFocusOnError } from './useFocusOnError';

describe('useFocusOnError', () => {
  it('focuses the element whose id matches the first error key', () => {
    document.body.innerHTML = `
      <input id="email" />
      <input id="password" />
    `;
    const password = document.getElementById('password') as HTMLInputElement;

    const { result } = renderHook(() => useFocusOnError());
    result.current({
      password: { type: 'required', message: 'Required' },
      email: { type: 'required', message: 'Required' },
    });

    const firstKeyed = document.getElementById('password') as HTMLInputElement;
    expect(document.activeElement).toBe(firstKeyed);
    expect(document.activeElement).toBe(password);
  });

  it('does nothing when there are no errors', () => {
    document.body.innerHTML = `<input id="unused" />`;
    const before = document.activeElement;
    const { result } = renderHook(() => useFocusOnError());
    result.current({});
    expect(document.activeElement).toBe(before);
  });

  it('does nothing when the first errored field has no matching element', () => {
    document.body.innerHTML = `<input id="present" />`;
    const before = document.activeElement;
    const { result } = renderHook(() => useFocusOnError());
    result.current({ missing: { type: 'required', message: 'Required' } });
    expect(document.activeElement).toBe(before);
  });
});
