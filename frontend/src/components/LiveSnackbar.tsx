import { useEffect, useState } from 'react';
import {
  ANNOUNCE_EVENT,
  announceTarget,
  type AnnounceDetail,
} from '../hooks/useAnnounce';

const visuallyHiddenStyle: React.CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

export function LiveSnackbar() {
  const [politeMessage, setPoliteMessage] = useState('');
  const [assertiveMessage, setAssertiveMessage] = useState('');

  useEffect(() => {
    const handler = (event: Event) => {
      const { message, politeness } = (event as CustomEvent<AnnounceDetail>).detail;
      if (politeness === 'assertive') {
        setAssertiveMessage('');
        requestAnimationFrame(() => setAssertiveMessage(message));
      } else {
        setPoliteMessage('');
        requestAnimationFrame(() => setPoliteMessage(message));
      }
    };
    announceTarget.addEventListener(ANNOUNCE_EVENT, handler);
    return () => announceTarget.removeEventListener(ANNOUNCE_EVENT, handler);
  }, []);

  return (
    <>
      <div aria-live="polite" role="status" style={visuallyHiddenStyle}>
        {politeMessage}
      </div>
      <div role="alert" style={visuallyHiddenStyle}>
        {assertiveMessage}
      </div>
    </>
  );
}
