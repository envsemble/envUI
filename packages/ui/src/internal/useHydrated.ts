import { useSyncExternalStore } from 'react';

const noSubscription = () => () => {};
const onClient = () => true;
const onServer = () => false;

/**
 * False while rendering on the server and while hydrating that output, true afterwards and in a
 * page rendered only in the browser. Output that depends on the browser, such as its language, time
 * zone or clock, waits for it, so hydration meets the server's output and then shows the browser's.
 */
export function useHydrated() {
  return useSyncExternalStore(noSubscription, onClient, onServer);
}
