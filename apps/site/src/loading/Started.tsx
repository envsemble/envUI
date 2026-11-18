import { startTransition, useEffect, useState, type ReactNode } from 'react';
import { FiguresMounted } from './useFiguresMounted';

export function Started({ hydrating, children }: { hydrating: boolean; children: ReactNode }) {
  const [hydrated, setHydrated] = useState(!hydrating);
  useEffect(() => {
    document.documentElement.setAttribute('data-site-started', '');
    startTransition(() => setHydrated(true));
  }, []);
  return <FiguresMounted value={hydrated}>{children}</FiguresMounted>;
}
