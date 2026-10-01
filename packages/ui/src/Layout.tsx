import type { ComponentPropsWithRef, CSSProperties } from 'react';

/** A step in the shared spacing scale; 0 removes the gap. */
export type SpaceStep = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface StackProps extends ComponentPropsWithRef<'div'> {
  gap?: SpaceStep;
  align?: 'start' | 'center' | 'end' | 'stretch';
}

/** Vertical composition. The parent owns spacing between its direct children. */
export function Stack({ gap = 4, align = 'stretch', className, style, ...props }: StackProps) {
  return (
    <div
      {...props}
      className={['env-stack', className].filter(Boolean).join(' ')}
      data-align={align}
      style={
        {
          '--env-stack-gap': gap === 0 ? '0' : `var(--space-${gap})`,
          ...style,
        } as CSSProperties
      }
    />
  );
}

export interface ActionGroupProps extends ComponentPropsWithRef<'div'> {
  stacked?: boolean;
  align?: 'start' | 'center' | 'end';
}

/** Wrapped actions use a 1 rem gap; stacked actions use 0.5 rem and fill the group. */
export function ActionGroup({
  stacked = false,
  align = 'start',
  className,
  ...props
}: ActionGroupProps) {
  return (
    <div
      {...props}
      className={['env-action-group', className].filter(Boolean).join(' ')}
      data-stacked={stacked || undefined}
      data-align={align}
    />
  );
}
