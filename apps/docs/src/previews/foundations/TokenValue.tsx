import { useLayoutEffect, useRef, useState } from 'react';

/** Read the actual public token value from this specimen's theme boundary. */
export function TokenValue({ token }: { token: string }) {
  const tokenElement = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState('');
  useLayoutEffect(() => {
    if (tokenElement.current)
      setValue(getComputedStyle(tokenElement.current).getPropertyValue(token).trim());
  }, [token]);
  return <span ref={tokenElement}>{value}</span>;
}
