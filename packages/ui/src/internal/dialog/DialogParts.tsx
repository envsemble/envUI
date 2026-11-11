'use client';

import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import { createContext, type ComponentPropsWithRef, type ReactNode } from 'react';
import { classNames } from '../classNames.js';
import { Column, Grid, Row } from '../../layout/Layout.js';
import { Surface, type SurfaceProps } from '../../layout/Surface.js';
import { Theme, type ThemeProps } from '../../foundations/Theme.js';
import { SkeletonScope } from '../../foundations/SkeletonScope.js';
import { usePortalContainer } from '../popup/PortalContainerContext.js';
import { useModalPresence } from './useModalPresence.js';
import '../../styles/Base.css';
import '../../styles/Dialog.css';

/**
 * The parts Dialog, Sheet, CommandPalette and other modal surfaces share, inside a Base UI Dialog
 * or Drawer root: the backdrop, the raised surface, the heading block and the actions row. Each owner
 * adds its own class for its placement and motion.
 */

/**
 * The theme boundary in a modal surface's portal. It has no box and is no container, so it starts
 * no stacking context: the backdrop and the surface's positioner keep their own layers, under what
 * opens over them, and the positioner, fixed over the viewport, is the env-window container.
 */
export function OverlayTheme({ className, ...props }: ThemeProps) {
  return <Theme {...props} className={classNames('env-overlay-theme', className)} />;
}

/**
 * The backdrop behind a modal surface, which fades in and out. While it is mounted the surface counts
 * as open in its portal container, so toasts there wait until it has closed.
 */
export function DialogBackdrop({ className }: { className?: string }) {
  useModalPresence(usePortalContainer().container);
  return <BaseDialog.Backdrop className={classNames('env-dialog-backdrop', className)} />;
}

/**
 * The raised surface of a dialog or a sheet, for its popup's render: the body text and the
 * scrolling that a dialog's content needs. Its owner sets its fill and edge (Dialog.css, Sheet.css).
 */
export function DialogSurface({ className, ...props }: SurfaceProps) {
  return (
    <Surface
      background="default"
      padding={5}
      {...props}
      className={classNames('env-dialog-surface', className)}
    />
  );
}

/**
 * The title, with a close button at its end where the owner passes one, and the description under
 * it. The title names the dialog and the description describes it; the description belongs to the
 * title, so they sit closer together than the dialog's sections, and what follows the heading block
 * sits that same gap below it (Dialog.css): one gap under the title, whether a description or the
 * content comes next.
 */
export function DialogHeader({
  title,
  description,
  close,
}: {
  title?: ReactNode;
  description?: ReactNode;
  close?: ReactNode;
}) {
  if (title == null && description == null && close == null) return null;
  return (
    <Grid gap={3} className="env-dialog-header">
      {(title != null || close != null) && (
        <Row align="center" justify="between" gap={4} className="env-dialog-heading">
          {title != null ? (
            <BaseDialog.Title className="env-dialog-title">{title}</BaseDialog.Title>
          ) : (
            <span />
          )}
          {close}
        </Row>
      )}
      {description != null && (
        <BaseDialog.Description className="env-dialog-description">
          {description}
        </BaseDialog.Description>
      )}
    </Grid>
  );
}

/**
 * Whether the work a dialog or a sheet started is pending, which its DialogClose buttons read to
 * turn off, as the built-in close button does.
 */
export const DialogPendingContext = createContext(false);

/** The row of a dialog's actions at its end, with the primary action last. */
export function DialogActions({ children, ...props }: ComponentPropsWithRef<'div'>) {
  return (
    <Row gap={4} {...props} wrap align="center" justify="end" className="env-dialog-actions">
      {children}
    </Row>
  );
}

/** The content column of a dialog: header, content and actions 1.5 rem apart. */
export function DialogContent({
  skeleton = false,
  children,
}: {
  skeleton?: boolean;
  children: ReactNode;
}) {
  // A skeleton dialog keeps focus on its popup, the busy root, which closes with Escape; its
  // content is inert.
  return (
    <Column gap={5} className="env-dialog-content" inert={skeleton || undefined}>
      <SkeletonScope skeleton={skeleton}>{children}</SkeletonScope>
    </Column>
  );
}
