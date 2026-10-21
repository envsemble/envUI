import {
  cloneElement,
  createElement,
  isValidElement,
  type CSSProperties,
  type ReactElement,
} from 'react';
import { classNames } from './classNames.js';

type Props = Record<string, unknown> & { className?: string; style?: CSSProperties };

/**
 * Renders a component's props onto the element its `render` prop gives, or onto a `tag` of its own,
 * without a hook, so that a server component can take `render`, as Text does. The element's own
 * props win, except that classes join and styles merge (the element's last); a ref given to the
 * component reaches the node in place of one on the element.
 */
export function renderElement(tag: string, render: ReactElement | undefined, props: Props) {
  if (!isValidElement(render)) return createElement(tag, props);
  const own = render.props as Props;
  return cloneElement(render as ReactElement<Props>, {
    ...props,
    ...own,
    className: classNames(props.className, own.className) || undefined,
    style: props.style || own.style ? { ...props.style, ...own.style } : undefined,
    ...(props.ref !== undefined && { ref: props.ref }),
  });
}
