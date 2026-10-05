import { createElement, type ComponentPropsWithRef } from 'react';
import { classNames } from '../internal/classNames.js';

export type TextElement =
  | 'p'
  | 'span'
  | 'small'
  | 'strong'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6';
export type TextVariant = 'body' | 'page-heading' | 'section-heading' | 'supporting' | 'caption';

export type TextTone = 'primary' | 'muted' | 'quiet';

export type TextProps<Element extends TextElement = 'p'> = {
  as?: Element;
  variant?: TextVariant;
  tone?: TextTone;
} & Omit<ComponentPropsWithRef<Element>, 'as' | 'variant' | 'tone'>;

/** Semantic native text with typography and color from the shared token scale. */
export function Text<Element extends TextElement = 'p'>({
  as,
  variant = 'body',
  tone,
  className,
  ...props
}: TextProps<Element>) {
  return createElement(as ?? 'p', {
    ...props,
    className: classNames(
      'env-text',
      `env-text-${variant}`,
      tone && `env-text-tone-${tone}`,
      className,
    ),
  });
}
