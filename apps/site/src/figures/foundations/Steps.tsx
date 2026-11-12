import type { ReactNode } from 'react';
import { classNames } from '../../shared/Attributes';

/*
 * Parts of the foundations' animated figures that step through states, such as a card at each text
 * size or a dialog in each scale: the states stacked in one place, so the figure keeps the height
 * of the tallest, and a quiet label in the stage's corner naming the state shown.
 */

/**
 * Each state of a figure, drawn by `render`, stacked in one place with only the one at `at` shown:
 * the place is as large as the largest, so nothing around it moves as the states change.
 */
export function StepStack({
  count,
  at,
  render,
  className,
}: {
  count: number;
  at: number;
  render: (index: number) => ReactNode;
  className?: string;
}) {
  return (
    <div className={classNames('catalogue-step-stack', className)}>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} data-current={index === at || undefined}>
          {render(index)}
        </div>
      ))}
    </div>
  );
}

/** A quiet label in the top start corner of an animated figure's stage, naming what it shows. */
export function CornerLabel({ children }: { children: ReactNode }) {
  return <span className="catalogue-corner-label">{children}</span>;
}

/**
 * Content at a text size, as a reader's browser setting makes it: every length in rem grows by
 * `size`, a factor, so text, controls and their spaces grow together, while the box it fills keeps
 * its width, so the content rewraps and its container queries see less room, as they would.
 */
export function AtTextSize({ size, children }: { size: number; children: ReactNode }) {
  return <div style={{ zoom: size }}>{children}</div>;
}
