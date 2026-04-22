import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function FocusOnRouteChange() {
  const location = useLocation();

  useEffect(() => {
    const heading = document.querySelector<HTMLElement>('main h1');
    const target = heading ?? document.getElementById('main');
    target?.focus();
  }, [location.pathname]);

  return null;
}
