import { startTransition, useEffect, useState } from 'react';

/**
 * Whether the component's first paint has passed. A long page renders the parts past its start
 * after it, as a transition React splits into short tasks: its start shows sooner, and the page
 * answers input meanwhile.
 */
export function useAfterPaint() {
  const [after, setAfter] = useState(false);
  useEffect(() => {
    startTransition(() => setAfter(true));
  }, []);
  return after;
}
