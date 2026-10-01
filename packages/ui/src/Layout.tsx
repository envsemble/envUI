import { createElement, type ComponentPropsWithRef, type CSSProperties } from 'react';

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
  gap?: SpaceStep;
  align?: 'start' | 'center' | 'end' | 'stretch';
}
export type StackProps<Element extends StackElement = 'div'> = StackOptions & {
  as?: Element;
} & Omit<ComponentPropsWithRef<Element>, keyof StackOptions | 'as'>;

/** Vertical composition. The parent owns spacing between its direct children. */
export function Stack<Element extends StackElement = 'div'>({
  as,
  gap = 4,
  align = 'stretch',
  className,
  style,
  ...props
}: StackProps<Element>) {
  return createElement(as ?? 'div', {
    ...props,
    className: ['env-stack', className].filter(Boolean).join(' '),
    'data-align': align,
    style: {
      '--env-stack-gap': gap === 0 ? '0' : `var(--space-${gap})`,
      ...style,
    } as CSSProperties,
  });
}

interface ActionGroupOptions {
  stacked?: boolean;
  align?: 'start' | 'center' | 'end';
}
export type ActionGroupProps<Element extends StackElement = 'div'> = ActionGroupOptions & {
  as?: Element;
} & Omit<ComponentPropsWithRef<Element>, keyof ActionGroupOptions | 'as'>;

/** Wrapped actions use a 1 rem gap; stacked actions use 0.5 rem and fill the group. */
export function ActionGroup<Element extends StackElement = 'div'>({
  as,
  stacked = false,
  align = 'start',
  className,
  ...props
}: ActionGroupProps<Element>) {
  return createElement(as ?? 'div', {
    ...props,
    className: ['env-action-group', className].filter(Boolean).join(' '),
    'data-stacked': stacked || undefined,
    'data-align': align,
  });
}
