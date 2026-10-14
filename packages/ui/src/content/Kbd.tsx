import type { ComponentPropsWithRef } from 'react';
import { classNames } from '../internal/classNames.js';

export interface KbdProps extends ComponentPropsWithRef<'kbd'> {
  /** A key combination, such as ['Ctrl', 'P']; rendered as keys joined by +. */
  keys?: readonly string[];
}

/** A keyboard key, or a combination of keys with keys. */
export function Kbd({ keys, children, className, ...props }: KbdProps) {
  if (!keys)
    return (
      <kbd {...props} className={classNames('env-kbd', className)}>
        {children}
      </kbd>
    );
  return (
    <kbd {...props} className={classNames('env-kbd-combination', className)}>
      {keys.map((key, index) => (
        <span key={index} className="env-kbd-part">
          {index > 0 && <span className="env-kbd-separator">+</span>}
          <kbd className="env-kbd">{key}</kbd>
        </span>
      ))}
    </kbd>
  );
}
