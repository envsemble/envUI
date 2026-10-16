'use client';

import {
  createElement,
  type ComponentPropsWithRef,
  type CSSProperties,
  type ReactElement,
} from 'react';
import { useRender } from '@base-ui/react/use-render';
import { classNames } from '../internal/classNames.js';

/** A step in the shared spacing scale; 0 removes the gap. */
export type SpaceStep = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type StackElement =
  | 'div'
  | 'section'
  | 'article'
  | 'nav'
  | 'main'
  | 'aside'
  | 'header'
  | 'footer';
interface StackOptions {
  /**
   * The space between the direct children, as a step of the spacing scale: 1 is 0.25 rem, 2 is
   * 0.5 rem, 3 is 0.75 rem, 4 is 1 rem, 5 is 1.5 rem, 6 is 2 rem, 7 is 2.5 rem, 8 is 3 rem and 9 is
   * 4 rem; 0 removes it.
   */
  gap?: SpaceStep;
  /**
   * How the children line up across the stack: stretch makes each as wide as the stack, except
   * controls such as buttons, which keep their own width; start, center and end keep every child
   * at its own width, at that side or in the middle.
   */
  align?: 'start' | 'center' | 'end' | 'stretch';
}
export type StackProps<Element extends StackElement = 'div'> = StackOptions & {
  /**
   * The element to render, for its meaning: div by default, or section, article, nav, main, aside,
   * header or footer. With render, set the element there instead.
   */
  as?: Element;
  /**
   * Another element to lay out as the stack, without a wrapper, such as a Surface or a Theme: the
   * stack's class, gap and alignment merge into its props. It must forward native props and refs.
   */
  render?: ReactElement;
} & Omit<ComponentPropsWithRef<Element>, keyof StackOptions | 'as' | 'render'>;

/**
 * A vertical layout: its direct children in a column, a step of the spacing scale apart, so the
 * parent owns the space between them and the children need no margins.
 */
export function Stack<Element extends StackElement = 'div'>({
  as,
  render,
  gap = 4,
  align = 'stretch',
  className,
  style,
  ...props
}: StackProps<Element>) {
  return useRender({
    defaultTagName: as ?? 'div',
    render,
    props: {
      ...props,
      className: classNames('env-stack', className),
      'data-align': align,
      style: {
        '--env-stack-gap': gap === 0 ? '0' : `var(--env-space-${gap})`,
        ...style,
      } as CSSProperties,
    },
  });
}

interface ActionGroupOptions {
  /**
   * Stack the actions in a column, 0.5 rem apart, where each labelled button takes the group's
   * width and icon-only buttons keep their size. Otherwise they sit in a row, 1 rem apart, and wrap
   * onto more rows when they don't fit.
   */
  stacked?: boolean;
  /**
   * Where a row of actions sits: at the start, in the center or at the end, such as at the end of
   * a form. A stacked group fills its width instead.
   */
  align?: 'start' | 'center' | 'end';
}
export type ActionGroupProps<Element extends StackElement = 'div'> = ActionGroupOptions & {
  /**
   * The element to render, for its meaning: div by default, or footer for the actions of a card or
   * a form, or section, article, nav, main, aside or header.
   */
  as?: Element;
} & Omit<ComponentPropsWithRef<Element>, keyof ActionGroupOptions | 'as'>;

/**
 * A set of actions laid out together, such as a form's Cancel and Save: a row 1 rem apart that
 * wraps when it runs out of room, or a column 0.5 rem apart whose labelled buttons fill it. It
 * adds layout only, no role or keyboard behaviour.
 */
export function ActionGroup<Element extends StackElement = 'div'>({
  as,
  stacked = false,
  align = 'start',
  className,
  ...props
}: ActionGroupProps<Element>) {
  return createElement(as ?? 'div', {
    ...props,
    className: classNames('env-action-group', className),
    'data-stacked': stacked || undefined,
    'data-align': align,
  });
}
