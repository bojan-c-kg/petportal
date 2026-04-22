import { useCallback } from 'react';

export type Politeness = 'polite' | 'assertive';

export interface AnnounceDetail {
  message: string;
  politeness: Politeness;
}

export const ANNOUNCE_EVENT = 'petportal-announce';
export const announceTarget: EventTarget =
  typeof window !== 'undefined' ? window : new EventTarget();

export function useAnnounce() {
  return useCallback((message: string, politeness: Politeness = 'polite') => {
    const detail: AnnounceDetail = { message, politeness };
    announceTarget.dispatchEvent(new CustomEvent<AnnounceDetail>(ANNOUNCE_EVENT, { detail }));
  }, []);
}
