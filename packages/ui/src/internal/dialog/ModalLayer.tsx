'use client';

import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import type { ReactNode } from 'react';
import { classNames } from '../classNames.js';
import { Theme, useTheme, type ThemeProps } from '../../foundations/Theme.js';
import { ResetControlDefaults } from '../control/ControlDefaults.js';
import { usePortalContainer } from '../popup/PortalContainerContext.js';
import type { Direction } from '../provider/EnvUIContext.js';
import { useModalPresence } from './useModalPresence.js';
import '../../styles/Base.css';
import '../../styles/Dialog.css';

/**
 * The theme boundary in a modal surface's portal. It has no box and is no container, so it starts
 * no stacking context: the backdrop and the surface's positioner keep their own layers, under what
 * opens over them, and the positioner, fixed over the viewport, is the env-window container.
 */
function OverlayTheme({ className, ...props }: ThemeProps) {
  return <Theme {...props} className={classNames('env-overlay-theme', className)} />;
}

/**
 * The backdrop behind a modal surface, which fades in and out. A modal opened from inside another,
 * such as a Dialog from a Sheet, has one of its own over the one below. While it is mounted the
 * surface counts as open in its portal container, so toasts there wait until it has closed.
 */
function DialogBackdrop({ className }: { className?: string }) {
  useModalPresence(usePortalContainer().container);
  return (
    <BaseDialog.Backdrop forceRender className={classNames('env-dialog-backdrop', className)} />
  );
}

export function ModalLayer({
  backdrop,
  dir,
  children,
}: {
  backdrop: { className?: string } | false;
  dir?: Direction;
  children: ReactNode;
}) {
  const theme = useTheme();
  return (
    <OverlayTheme {...theme} dir={dir}>
      <ResetControlDefaults>
        {backdrop && <DialogBackdrop className={backdrop.className} />}
        {children}
      </ResetControlDefaults>
    </OverlayTheme>
  );
}
