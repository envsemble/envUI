import type { HTMLAttributes, Ref } from 'react';

/**
 * The attributes of the element that opens a menu, a Menu.Submenu's row or a Menubar.Menu's
 * button, such as a className, a style, a ref or a data attribute; the menu's own className, style
 * and ref are its popup's.
 */
export interface TriggerProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'children' | 'aria-keyshortcuts'
> {
  /** The trigger's element. */
  ref?: Ref<HTMLElement>;
  [attribute: `data-${string}`]: string | number | boolean | undefined;
}
