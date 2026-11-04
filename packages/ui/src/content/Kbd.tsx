import type { ComponentPropsWithRef } from 'react';
import { classNames } from '../internal/classNames.js';
import '../styles/Base.css';
import '../styles/Kbd.css';

export interface KbdProps extends ComponentPropsWithRef<'kbd'> {
  /**
   * Keys pressed together, such as ['Ctrl', 'P']: one key cap each, joined by +, inside an outer
   * `<kbd>`. Without it, the children are one key.
   */
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
