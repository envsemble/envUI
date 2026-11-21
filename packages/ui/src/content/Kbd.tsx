import type { ComponentPropsWithRef, ReactNode } from 'react';
import { classNames } from '../internal/classNames.js';
import '../styles/Base.css';
import '../styles/Kbd.css';

export interface KbdProps extends ComponentPropsWithRef<'kbd'> {
  /**
   * Keys pressed together, such as ['Ctrl', 'P']: one key cap each, joined by the separator,
   * inside an outer `<kbd>`. A key can be any content, such as an icon for an arrow or Return.
   * Without it, the children are one key.
   */
  keys?: readonly ReactNode[];
  /**
   * What joins the keys: a +, null for none, as in ⌘⇧P, or a word for keys pressed one after
   * another, such as then in G then I.
   * @default '+'
   */
  separator?: ReactNode;
}

/** A keyboard key, or a combination of keys with keys. */
export function Kbd({ keys, separator = '+', children, className, ...props }: KbdProps) {
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
          {index > 0 && separator != null && <span className="env-kbd-separator">{separator}</span>}
          <kbd className="env-kbd">{key}</kbd>
        </span>
      ))}
    </kbd>
  );
}
