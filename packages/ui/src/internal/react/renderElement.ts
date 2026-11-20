import {
  cloneElement,
  createElement,
  isValidElement,
  type CSSProperties,
  type ReactElement,
  type Ref,
} from 'react';
import { classNames } from '../classNames.js';
import { mergeRefs } from './setRef.js';

type Props = Record<string, unknown> & { className?: string; style?: CSSProperties };

const eventHandlerPropName = /^on[A-Z]/;

/**
 * Renders a component's props onto the element its `render` prop gives, or onto a `tag` of its own,
 * without a hook, so that a server component can take `render`, as Text does. As Base UI's
 * mergeProps does, the element's own props win, except that classes join, styles merge (the
 * element's last), event handlers both run (the element's first) and both refs receive the node.
 */
export function renderElement(tag: string, render: ReactElement | undefined, props: Props) {
  if (!isValidElement(render)) return createElement(tag, props);
  const own = render.props as Props;
  const merged: Props = { ...props, ...own };
  for (const name of Object.keys(props)) {
    const ours = props[name];
    const theirs = own[name];
    if (
      !eventHandlerPropName.test(name) ||
      typeof ours !== 'function' ||
      typeof theirs !== 'function'
    )
      continue;
    merged[name] = (...args: unknown[]) => {
      (theirs as (...values: unknown[]) => unknown)(...args);
      (ours as (...values: unknown[]) => unknown)(...args);
    };
  }
  const ownRef = own.ref as Ref<unknown> | undefined;
  const ref = props.ref as Ref<unknown> | undefined;
  return cloneElement(render as ReactElement<Props>, {
    ...merged,
    className: classNames(props.className, own.className) || undefined,
    style: props.style || own.style ? { ...props.style, ...own.style } : undefined,
    ...(ref !== undefined && { ref: ownRef ? mergeRefs(ref, ownRef) : ref }),
  });
}
