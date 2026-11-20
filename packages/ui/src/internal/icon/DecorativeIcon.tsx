import type { ReactNode } from 'react';
import { classNames } from '../classNames.js';
import '../../styles/Base.css';

/** Shared sizing wrapper that hides decorative icons from assistive technology. */
export function DecorativeIcon({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <span className={classNames('env-icon', className)} aria-hidden="true">
      {children}
    </span>
  );
}
