import { createContext, useContext } from 'react';
import { Toast as BaseToast } from '@base-ui/react/toast';
import { ToastRegion } from './ToastRegion.js';
import { useToastController } from './useToastController.js';
import { toastPlacements } from './ToastTypes.js';
import type { ToastManager, ToastProviderProps } from './ToastTypes.js';

const ManagerContext = createContext<ToastManager | null>(null);

export function useToast(): ToastManager {
  const manager = useContext(ManagerContext);
  if (!manager)
    throw new Error('useToast must be used inside ToastProvider. Manual Toast needs no provider.');
  return manager;
}

export function ToastProvider({
  children,
  defaultPlacement = 'bottom-right',
  visibleLimit = 3,
}: ToastProviderProps) {
  if (!Number.isInteger(visibleLimit) || visibleLimit < 1)
    throw new RangeError('visibleLimit must be a positive integer.');
  if (!toastPlacements.includes(defaultPlacement))
    throw new RangeError('Unsupported toast placement.');
  return (
    <ManagedToastRegions defaultPlacement={defaultPlacement} visibleLimit={visibleLimit}>
      {children}
    </ManagedToastRegions>
  );
}

function ManagedToastRegions({
  children,
  defaultPlacement,
  visibleLimit,
}: Required<ToastProviderProps>) {
  const controller = useToastController(defaultPlacement, visibleLimit);
  return (
    <ManagerContext value={controller.manager}>
      {children}
      {toastPlacements.map((placement) => (
        <BaseToast.Provider key={placement} timeout={0} limit={Number.MAX_SAFE_INTEGER}>
          <ToastRegion placement={placement} controller={controller} />
        </BaseToast.Provider>
      ))}
    </ManagerContext>
  );
}
