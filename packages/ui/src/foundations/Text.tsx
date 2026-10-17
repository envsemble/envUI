import type { ComponentPropsWithRef, ReactElement, Ref } from 'react';
import { classNames } from '../internal/classNames.js';
import { renderElement } from '../internal/renderElement.js';

/**
 * A text style from the type scale: display for a page's introduction, body for running text,
 * headline for a page's heading, title for a section's, body-sm for supporting text and caption
 * for the smallest notes.
 */
export type TextVariant = 'display' | 'body' | 'headline' | 'title' | 'body-sm' | 'caption';

/** How strong text is: default, muted or subtle. */
export type TextEmphasis = 'default' | 'muted' | 'subtle';

export type TextProps<RenderedElement extends HTMLElement = HTMLParagraphElement> = Omit<
  ComponentPropsWithRef<'p'>,
  'color' | 'ref'
> & {
  /**
   * The text style: display for a page's introduction, body for running text, headline for a
   * page's heading, title for a section's, body-sm for supporting text and caption for the
   * smallest notes. body-sm and caption are muted unless emphasis says otherwise.
   * @default 'body'
   */
  variant?: TextVariant;
  /**
   * How strong the text is: default, the text color; muted, for supporting text; subtle, the
   * weakest, for text that should recede, such as a hint beside a value.
   */
  emphasis?: TextEmphasis;
  /**
   * The element to render, for its meaning, such as render={<h2 />} for a heading or
   * render={<span />} inside a line; a p by default. The text's class and attributes merge into its
   * props.
   */
  render?: ReactElement;
  /**
   * The rendered element, a p by default. Its type is the element type parameter, which a ref
   * passed in sets: a ref to the element that render makes, such as useRef<HTMLElement>(null) with
   * render={<section />}, type-checks, and `TextProps['ref']` is a ref to the default element, so a
   * wrapper can forward it to one.
   */
  ref?: Ref<RenderedElement>;
};

/** Semantic native text with typography and color from the shared token scale. */
export function Text<RenderedElement extends HTMLElement = HTMLParagraphElement>({
  variant = 'body',
  emphasis,
  render,
  className,
  ...props
}: TextProps<RenderedElement>) {
  return renderElement('p', render, {
    ...props,
    className: classNames('env-text', className),
    'data-variant': variant,
    'data-emphasis': emphasis,
  });
}
