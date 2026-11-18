import {
  Children,
  cloneElement,
  Fragment,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from 'react';
import { Button, type ButtonProps } from '../../actions/Button.js';

/**
 * A dialog's or a sheet's own actions, with the primary action, the last, pending while the dialog
 * is: a Button that sets no pending of its own takes the dialog's. A fragment's last child counts as
 * the last action. The actions pass through Children.toArray whether pending or not, so their keys,
 * and the focus of the button that started the work, stay as pending changes.
 */
export function withPendingAction(actions: ReactNode, pending: boolean): ReactNode {
  const items = Children.toArray(actions);
  const index = items.length - 1;
  const last = items[index];
  if (!isValidElement(last)) return items;
  if (last.type === Fragment) {
    const fragment = last as ReactElement<{ children?: ReactNode }>;
    items[index] = cloneElement(
      fragment,
      undefined,
      withPendingAction(fragment.props.children, pending),
    );
  } else if (pending && last.type === Button) {
    const button = last as ReactElement<ButtonProps>;
    if (button.props.pending === undefined) items[index] = cloneElement(button, { pending: true });
  }
  return items;
}
