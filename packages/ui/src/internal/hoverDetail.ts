import { Children, isValidElement, type ReactElement, type ReactNode } from 'react';

/**
 * The class a HoverCard or Tooltip gives a text trigger: a quiet dotted underline that says the
 * text shows more on hover or focus. An application's own text component takes it to look the
 * same.
 */
export const hoverDetailClass = 'env-hover-detail';

/** The inline elements that hold text and nothing else a reader acts on. */
const textTags = new Set([
  'abbr',
  'b',
  'bdi',
  'cite',
  'data',
  'dfn',
  'em',
  'i',
  'mark',
  'q',
  'small',
  'span',
  'strong',
  'sub',
  'sup',
  'time',
  'var',
]);

const textKey = Symbol.for('envui.text');

/** Marks envUI's Text, so a HoverCard or Tooltip can tell a text trigger. */
export function markText<Component extends object>(component: Component): Component {
  return Object.assign(component, { [textKey]: true });
}

interface TextLikeProps {
  children?: ReactNode;
  render?: unknown;
}

/** Whether an element is text: an inline text element, or Text that renders one or a p. */
function isTextElement(element: ReactElement<TextLikeProps>): boolean {
  const { type } = element;
  if (typeof type === 'string') return textTags.has(type);
  if ((typeof type !== 'function' && typeof type !== 'object') || type === null) return false;
  if ((type as unknown as Record<symbol, unknown>)[textKey] !== true) return false;
  const render = element.props.render;
  if (!isValidElement(render)) return true;
  return render.type === 'p' || (typeof render.type === 'string' && textTags.has(render.type));
}

/** Whether children hold visible text, through text elements only: an icon or avatar holds none. */
function holdsText(children: ReactNode): boolean {
  return Children.toArray(children).some((child) => {
    if (typeof child === 'string') return child.trim() !== '';
    if (typeof child === 'number') return true;
    return (
      isValidElement<TextLikeProps>(child) &&
      isTextElement(child) &&
      holdsText(child.props.children)
    );
  });
}

/**
 * Whether a trigger is text, which a dotted underline marks: an inline text element or Text that
 * holds text. Buttons, links, avatars, icons and other components aren't.
 */
export function isTextTrigger(element: ReactElement): boolean {
  const text = element as ReactElement<TextLikeProps>;
  return isTextElement(text) && holdsText(text.props.children);
}
