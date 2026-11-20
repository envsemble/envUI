'use client';

import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import { createContext, type ComponentPropsWithRef, type ReactNode } from 'react';
import { classNames } from '../classNames.js';
import { Column, Grid, Row } from '../../layout/Layout.js';
import { Slot } from '../layout/Slot.js';
import { Surface, type SurfaceProps } from '../../layout/Surface.js';
import { Theme, type ThemeProps } from '../../foundations/Theme.js';
import { SkeletonScope } from '../skeleton/SkeletonScope.js';
import { usePortalContainer } from '../popup/PortalContainerContext.js';
import { useModalPresence } from './useModalPresence.js';
import '../../styles/Base.css';
import '../../styles/Dialog.css';

/**
 * The theme boundary in a modal surface's portal. It has no box and is no container, so it starts
 * no stacking context: the backdrop and the surface's positioner keep their own layers, under what
 * opens over them, and the positioner, fixed over the viewport, is the env-window container.
 */
export function OverlayTheme({ className, ...props }: ThemeProps) {
  return <Theme {...props} className={classNames('env-overlay-theme', className)} />;
}

/**
 * The backdrop behind a modal surface, which fades in and out. A modal opened from inside another,
 * such as a Dialog from a Sheet, has one of its own over the one below. While it is mounted the
 * surface counts as open in its portal container, so toasts there wait until it has closed.
 */
export function DialogBackdrop({ className }: { className?: string }) {
  useModalPresence(usePortalContainer().container);
  return (
    <BaseDialog.Backdrop forceRender className={classNames('env-dialog-backdrop', className)} />
  );
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
 * The title, with a close button at its end where the owner passes one, the application's content
 * before the title and before the close button, and the description under it. The title names the dialog and the description describes it; the description belongs to the
 * title, so they sit closer together than the dialog's sections, and what follows the heading block
 * sits that same gap below it (Dialog.css): one gap under the title, whether a description or the
 * content comes next.
 */
export function DialogHeader({
  title,
  description,
  close,
  start,
  end,
}: {
  title?: ReactNode;
  description?: ReactNode;
  close?: ReactNode;
  start?: ReactNode;
  end?: ReactNode;
}) {
  const heading = title != null || close != null || start != null || end != null;
  if (!heading && description == null) return null;
  return (
    <Grid gap={3} className="env-dialog-header">
      {heading && (
        <Row align="center" justify="between" gap={4} className="env-dialog-heading">
          {start != null && (
            <Slot className="env-dialog-header-start" layout="row" shrink="never">
              {start}
            </Slot>
          )}
          {title != null ? (
            <BaseDialog.Title className="env-dialog-title">{title}</BaseDialog.Title>
          ) : (
            <span />
          )}
          {end != null && (
            <Slot className="env-dialog-header-end" layout="row" shrink="never">
              {end}
            </Slot>
          )}
          {close}
        </Row>
      )}
      {description != null && (
        <BaseDialog.Description render={<div />} className="env-dialog-description">
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

/**
 * The row of a dialog's actions at its end, with the primary action last, and the application's
 * content at its start, which takes the room the actions leave.
 */
export function DialogActions({
  children,
  start,
  ...props
}: ComponentPropsWithRef<'div'> & { start?: ReactNode }) {
  return (
    <Row gap={4} {...props} wrap align="center" justify="end" className="env-dialog-actions">
      {start != null && (
        <Slot className="env-dialog-actions-start" layout="row" grow>
          {start}
        </Slot>
      )}
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
  const contentInertWhileSkeleton = skeleton || undefined;
  return (
    <Column gap={5} className="env-dialog-content" inert={contentInertWhileSkeleton}>
      <SkeletonScope skeleton={skeleton}>{children}</SkeletonScope>
    </Column>
  );
}
