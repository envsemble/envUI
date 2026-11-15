import { useSyncExternalStore } from 'react';

const noSubscription = () => () => {};
const onClient = () => true;
const onServer = () => false;

export function useHydrated() {
  return useSyncExternalStore(noSubscription, onClient, onServer);
}
