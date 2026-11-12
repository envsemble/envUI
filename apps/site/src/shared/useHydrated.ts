import { useSyncExternalStore } from 'react';

const noSubscription = () => () => {};
const onClient = () => true;
const onServer = () => false;

/**
 * False while rendering on the server and while hydrating that output, true afterwards and in a
 * page rendered only in the browser, so output that depends on the browser waits for it and
 * hydration meets the server's output.
 */
export function useHydrated() {
  return useSyncExternalStore(noSubscription, onClient, onServer);
}
