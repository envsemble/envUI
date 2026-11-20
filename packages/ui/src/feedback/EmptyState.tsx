import type { ComponentPropsWithRef, ReactNode } from 'react';
import { classNames } from '../internal/classNames.js';
import { DecorativeIcon } from '../internal/icon/DecorativeIcon.js';
import { Slot } from '../internal/layout/Slot.js';
import { rendersContent } from '../internal/react/rendersContent.js';
import '../styles/Base.css';
import '../styles/EmptyState.css';

export interface EmptyStateProps extends Omit<ComponentPropsWithRef<'div'>, 'title' | 'children'> {
  /**
   * A decorative icon above the title, such as the icon of what the region would list, at the
   * icon size of the region's width.
   */
  icon?: ReactNode;
  /**
   * A decorative illustration above the title, such as an SVG drawing or an image, at its own size
   * and no wider than the region, in place of the icon where both are given. It is hidden from
   * assistive technology.
   */
  illustration?: ReactNode;
  /** What the region would show, said as its absence, such as "No projects yet". */
  title: ReactNode;
  /** A sentence on why it is empty or what fills it, such as "Projects you create show here." */
  description?: ReactNode;
  /** What fills it, such as a Button that creates the first item, in a row that wraps. */
  actions?: ReactNode;
}

/**
 * What a region shows when it has nothing to show: an optional illustration or icon, a title, an optional
 * description and optional actions, centred in the region it fills, and compact where that region
 * is narrow.
 */
export function EmptyState({
  icon,
  illustration,
  title,
  description,
  actions,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div {...props} className={classNames('env-empty-state', className)}>
      {rendersContent(illustration) && (
        <Slot className="env-empty-state-illustration" aria-hidden>
          {illustration}
        </Slot>
      )}
      {rendersContent(icon) && !rendersContent(illustration) && (
        <Slot className="env-empty-state-icon" layout="row" shrink="never">
          <DecorativeIcon>{icon}</DecorativeIcon>
        </Slot>
      )}
      <div className="env-empty-state-heading">
        <Slot className="env-empty-state-title">{title}</Slot>
      </div>
      {rendersContent(description) && (
        <Slot className="env-empty-state-description">{description}</Slot>
      )}
      {rendersContent(actions) && (
        <Slot className="env-empty-state-actions" layout="row">
          {actions}
        </Slot>
      )}
    </div>
  );
}
