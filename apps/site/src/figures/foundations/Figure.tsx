/*
 * A foundation's figure (FoundationFigures.ts), on the same rules as a component page's: envUI at
 * work on the recessed canvas, with its legend, caption and code, and the numbered legend under
 * one. Every word in them is plain language for people looking at envUI: no token names, values or
 * units, which the foundation's guide in the Docs holds.
 */
import { createContext, useContext, type ReactNode } from 'react';
import { Text } from '@envsemble/envui';
import { ExampleCode } from '../LiveExample';
import { MotionStage } from '../../motion/MotionStage';
import { classNames } from '@envui-internal/internal/classNames';

/**
 * The example file whose source a foundation's figure shows as its code: the file of its name in
 * apps/site/src/examples/<page>/, which the page that places the figure provides where it has one.
 */
export const FigureCode = createContext<{ page: string; name: string } | null>(null);

/**
 * A figure that shows envUI at work: its content on the recessed canvas, marked when something in
 * it can be used, with its legend and caption below, and below them its code in a Code disclosure
 * where it has an example file (FigureCode). `label` names it for assistive technology.
 * With `motion`, what its pause button names, it is an animated figure, as a component page's
 * animated specimen is: its content plays on a MotionStage (usePointer, useTimeline, WidthSweep),
 * a picture with a pause button.
 */
export function Figure({
  label,
  children,
  legend,
  caption,
  className,
  motion,
}: {
  label: string;
  children: ReactNode;
  legend?: ReactNode;
  caption?: ReactNode;
  className?: string;
  motion?: string;
}) {
  const code = useContext(FigureCode);
  return (
    <figure className="site-topic-figure" aria-label={label}>
      {motion ? (
        <MotionStage label={motion} foundation className={className}>
          {children}
        </MotionStage>
      ) : (
        <div className={classNames('site-foundation-stage', className)} data-figure="example">
          {children}
        </div>
      )}
      {(legend || caption) && (
        <figcaption className="site-anatomy-caption">
          {caption && <p className="site-figure-caption">{caption}</p>}
          {legend}
        </figcaption>
      )}
      {code && <ExampleCode page={code.page} name={code.name} />}
    </figure>
  );
}

/** One entry of a numbered legend: the number its mark shows, a name and, where it has one, what it means. */
export interface LegendEntry {
  name: string;
  text: string;
}

/** A numbered legend under a figure, laid out as an anatomy figure's: each mark's number first. */
export function NumberedLegend({ entries }: { entries: readonly LegendEntry[] }) {
  return (
    <ol className="site-anatomy-legend catalogue-topic-legend">
      {entries.map((entry, index) => (
        <li key={entry.name}>
          <span className="site-anatomy-number" aria-hidden="true">
            {index + 1}
          </span>
          <div>
            <Text render={<p />} className="catalogue-topic-legend-name">
              {entry.name}
            </Text>
            {entry.text && (
              <Text render={<p />} variant="body-sm" emphasis="muted">
                {entry.text}
              </Text>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
