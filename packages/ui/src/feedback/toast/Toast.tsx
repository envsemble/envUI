'use client';

import { Toast as BaseToast } from '@base-ui/react/toast';
import { withDisplayName } from '../../internal/withDisplayName.js';
import { ToastRegion } from './ToastRegion.js';
import { useToastController } from './useToastController.js';
import { toastPlacements } from './toastInternals.js';
import type { ToastProviderProps } from './toastTypes.js';
import { ToastManagerContext } from './useToast.js';

export type { ToastProviderProps as ProviderProps } from './toastTypes.js';

/**
 * Hosts the notifications that useToast shows: brief feedback at the edge of the window, announced
 * and dismissed after a few seconds or by people. Put one near the root of the application; it
 * renders a region for each placement in a portal, in the theme of the place it is rendered.
 */
function Provider({ children, defaultPlacement = 'bottom-end', limit = 3 }: ToastProviderProps) {
  if (!Number.isInteger(limit) || limit < 1)
    throw new RangeError('limit must be a positive integer.');
  if (!toastPlacements.includes(defaultPlacement))
    throw new RangeError('Unsupported toast placement.');
  return (
    <ManagedToastRegions defaultPlacement={defaultPlacement} visibleLimit={limit}>
      {children}
    </ManagedToastRegions>
  );
}

function ManagedToastRegions({
  children,
  defaultPlacement,
  visibleLimit,
}: Required<ToastProviderProps>) {
  const controller = useToastController(defaultPlacement);
  return (
    <ToastManagerContext value={controller.manager}>
      {children}
      {toastPlacements.map((placement) => (
        <BaseToast.Provider key={placement} timeout={0} limit={Number.MAX_SAFE_INTEGER}>
          <ToastRegion placement={placement} controller={controller} visibleLimit={visibleLimit} />
        </BaseToast.Provider>
      ))}
    </ToastManagerContext>
  );
}

// Each part is named for React DevTools by a pure call, so a bundler drops the parts an
// application leaves unused.
const ProviderPart = /* @__PURE__ */ withDisplayName(Provider, 'Toast.Provider');
export { ProviderPart as Provider };
