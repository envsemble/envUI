import { Children, isValidElement, type ReactElement, type ReactNode } from 'react';
import { isMarkedText } from './textMark.js';
import '../../styles/Base.css';
import '../../styles/Text.css';
import '../../styles/HoverDetail.css';

/**
 * The class a HoverCard or Tooltip gives a text trigger: a quiet dotted underline that says the
 * text shows more on hover or focus. An application's own text component takes it to look the
 * same.
 */
export const hoverDetailClass = 'env-hover-detail';

const inlineTextOnlyTags = new Set([
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

interface TextLikeProps {
  children?: ReactNode;
  render?: unknown;
  className?: unknown;
  role?: unknown;
}

const rolesThatStayText = new Set([
  'text',
  'presentation',
  'none',
  'mark',
  'time',
  'term',
  'definition',
]);

function playsOtherPart({ role, className }: TextLikeProps): boolean {
  if (typeof role === 'string' && role.trim() !== '' && !rolesThatStayText.has(role.trim()))
    return true;
  return (
    typeof className === 'string' &&
    className.split(/\s+/).some((name) => name.startsWith('env-') && !name.startsWith('env-text'))
  );
}

function isTextElement(element: ReactElement<TextLikeProps>): boolean {
  const { type } = element;
  if (playsOtherPart(element.props)) return false;
  if (typeof type === 'string') {
    const textRenderedByServerComponent =
      type === 'p' &&
      typeof element.props.className === 'string' &&
      /(?:^|\s)env-text(?:\s|$)/.test(element.props.className);
    return inlineTextOnlyTags.has(type) || textRenderedByServerComponent;
  }
  if ((typeof type !== 'function' && typeof type !== 'object') || type === null) return false;
  if (!isMarkedText(type)) return false;
  const render = element.props.render;
  if (!isValidElement(render)) return true;
  return (
    render.type === 'p' || (typeof render.type === 'string' && inlineTextOnlyTags.has(render.type))
  );
}

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
 * holds text. Buttons, links, avatars, icons, counts such as an avatar group's "+2" and other
 * components aren't, nor is an element with a role other than text's.
 */
export function isTextTrigger(element: ReactElement): boolean {
  const text = element as ReactElement<TextLikeProps>;
  return isTextElement(text) && holdsText(text.props.children);
}
