'use client';

import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import type { ComponentPropsWithRef, ReactNode } from 'react';
import { classNames } from '../../internal/classNames.js';
import { Column, Row } from '../../foundations/Layout.js';
import { Surface, type SurfaceProps } from '../../foundations/Surface.js';

/**
 * The parts Dialog, Sheet, CommandPalette and other modal surfaces share, inside a Base UI Dialog
 * or Drawer root: the scrim, the raised surface, the heading block and the actions row. Each owner
 * adds its own class for its placement and motion.
 */

/** The scrim behind a modal surface, which fades in and out. */
export function DialogBackdrop({ className }: { className?: string }) {
  return <BaseDialog.Backdrop className={classNames('env-dialog-backdrop', className)} />;
}

/**
 * The raised surface of a dialog or a sheet, for its popup's render: the elevation-3 edge and
 * shadow, the body text and the scrolling that a dialog's content needs.
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
 * it. The title names the dialog and the description describes it.
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
    <div className="env-dialog-header">
      {(title != null || close != null) && (
        <div className="env-dialog-heading">
          {title != null ? (
            <BaseDialog.Title className="env-dialog-title">{title}</BaseDialog.Title>
          ) : (
            <span />
          )}
          {close}
        </div>
      )}
      {description != null && (
        <BaseDialog.Description className="env-dialog-description">
          {description}
        </BaseDialog.Description>
      )}
    </div>
  );
}

/** The row of a dialog's actions at its end, with the primary action last. */
export function DialogActions({ children, ...props }: ComponentPropsWithRef<'div'>) {
  return (
    <Row gap={4} {...props} wrap align="center" justify="end" className="env-dialog-actions">
      {children}
    </Row>
  );
}

/** The content column of a dialog: header, content and actions 1.5 rem apart. */
export function DialogContent({ children }: { children: ReactNode }) {
  return (
    <Column gap={5} className="env-dialog-content">
      {children}
    </Column>
  );
}
