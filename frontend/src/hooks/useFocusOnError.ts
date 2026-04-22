import { useCallback } from 'react';
import type { FieldErrors } from 'react-hook-form';

export function useFocusOnError() {
  return useCallback((errors: FieldErrors) => {
    const names = Object.keys(errors);
    if (names.length === 0) {
      return;
    }
    const target = document.getElementById(names[0]);
    if (target instanceof HTMLElement) {
      target.focus();
    }
  }, []);
}
