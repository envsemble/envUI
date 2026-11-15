import { createContext, useContext, type ReactNode } from 'react';
import { Text } from '@envsemble/envui';
import { ExampleCode } from '../LiveExample';
import { MotionStage } from '../MotionStage';
import { classNames } from '../../shared/Attributes';

export const FigureCode = createContext<{ page: string; name: string } | null>(null);

export const FigurePart = createContext<string | undefined>(undefined);

export function FoundationFrame({
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
    <figure
      className="site-topic-figure"
      aria-label={label}
      data-site-figure={useContext(FigurePart)}
    >
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

export interface LegendEntry {
  name: string;
  text: string;
}

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
