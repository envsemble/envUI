'use client';

import type { ComponentPropsWithRef, CSSProperties, ReactElement, Ref } from 'react';
import { useRender } from '@base-ui/react/use-render';
import { classNames } from '../internal/classNames.js';

/** A step in the shared spacing scale; 0 removes the gap. */
export type SpaceStep = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

interface StackOptions {
  /**
   * The direction the children run in: column, one under another, or row, side by side, such as
   * a form's actions.
   * @default 'column'
   */
  direction?: 'column' | 'row';
  /** Let a row wrap onto more lines when its children don't fit, as a row of actions does. */
  wrap?: boolean;
  /**
   * The space between the direct children, as a step of the spacing scale: 1 is 0.25 rem, 2 is
   * 0.5 rem, 3 is 0.75 rem, 4 is 1 rem, 5 is 1.5 rem, 6 is 2 rem, 7 is 2.5 rem, 8 is 3 rem and 9 is
   * 4 rem; 0 removes it.
   * @default 4
   */
  gap?: SpaceStep;
  /**
   * How the children line up across the stack: stretch makes each as wide as a column (as tall as
   * a row), except controls such as buttons, which keep their own size; start, center and end keep
   * every child at its own size, at that side or in the middle.
   * @default 'stretch'
   */
  align?: 'start' | 'center' | 'end' | 'stretch';
  /**
   * Where the children sit along the stack when there is room to spare: at the start, in the
   * center, at the end, such as a form's actions at its end, or between, spread out with the
   * first and last at the edges.
   * @default 'start'
   */
  justify?: 'start' | 'center' | 'end' | 'between';
}
export type StackProps<RenderedElement extends HTMLElement = HTMLDivElement> = StackOptions & {
  /**
   * The element to render, for its meaning, such as render={<section />} or render={<footer />},
   * or another component to lay out as the stack without a wrapper, such as a Surface or a Theme:
   * the stack's class, gap and alignment merge into its props. It must forward native props and
   * refs. A div by default.
   */
  render?: ReactElement;
  /**
   * The rendered element, a div by default. Its type is the element type parameter, which a ref
   * passed in sets: a ref to the element that render makes, such as useRef<HTMLElement>(null) with
   * render={<section />}, type-checks, and `StackProps['ref']` is a ref to the default element, so a
   * wrapper can forward it to one.
   */
  ref?: Ref<RenderedElement>;
} & Omit<ComponentPropsWithRef<'div'>, keyof StackOptions | 'ref'>;

/**
 * A layout of its direct children in a column, or a row, a step of the spacing scale apart, so the
 * parent owns the space between them and the children need no margins.
 */
export function Stack<RenderedElement extends HTMLElement = HTMLDivElement>({
  render,
  direction = 'column',
  wrap = false,
  gap = 4,
  align = 'stretch',
  justify = 'start',
  className,
  style,
  ...props
}: StackProps<RenderedElement>) {
  return useRender({
    defaultTagName: 'div',
    render,
    props: {
      ...props,
      className: classNames('env-stack', className),
      'data-direction': direction === 'row' ? direction : undefined,
      'data-wrap': wrap || undefined,
      'data-align': align,
      'data-justify': justify === 'start' ? undefined : justify,
      style: {
        '--env-stack-gap': gap === 0 ? '0' : `var(--env-space-${gap})`,
        ...style,
      } as CSSProperties,
    },
  });
}
