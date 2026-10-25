import type { ReactNode } from 'react';
import { Column, Text } from '@envsemble/envui';
import { InteractiveMark } from '../../template/InteractiveMark';

/**
 * The parts a foundation page is written in, on the same rules as a component page's: a section
 * under its h2 with the lead that opens it, titled blocks of a heading and a short paragraph or two
 * beside their figure, figures that show envUI at work on the recessed canvas, and the system's
 * own specimens, such as swatches, on the page. Every word in them is plain language for people
 * looking at envUI: no token names, values or units, which the foundation's guide in the Docs
 * holds.
 *
 * The parts set the Site's type hierarchy (SiteText.css), so a page never has to: the section's
 * title large, its lead a step larger than body text, a block's title in the title style and its
 * paragraphs quieter, in the muted color, and the notes of figures and legends smaller still, each
 * in a readable measure.
 */

/**
 * A section of a foundation page: its h2 title, its lead, the one or two sentences that open it and
 * say what matters most, and its blocks.
 */
export function Topic({
  title,
  lead,
  children,
}: {
  title: string;
  lead?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Column render={<section />} gap={0} data-size="wide" className="docs-example docs-topic">
      <Text render={<h2 />} variant="headline">
        {title}
      </Text>
      {lead && <Text className="docs-lead docs-topic-lead">{lead}</Text>}
      <div className="docs-topic-blocks">{children}</div>
    </Column>
  );
}

/**
 * A titled block: a heading and a short paragraph, or a few short ones given as a list, beside its
 * one figure on a wide page, or above a figure that needs the whole column (`stacked`). Without a
 * figure it is the text alone. Its paragraphs support the figure, so they are the quieter color.
 */
export function Block({
  title,
  text,
  children,
  stacked = false,
}: {
  title: string;
  text: ReactNode | readonly ReactNode[];
  children?: ReactNode;
  stacked?: boolean;
}) {
  const paragraphs: readonly ReactNode[] = Array.isArray(text) ? text : [text];
  const words = (
    <div className="docs-topic-text">
      <Text render={<h3 />} variant="title">
        {title}
      </Text>
      {paragraphs.map((paragraph, index) => (
        <Text key={index} render={<p />} emphasis="muted" className="docs-supporting">
          {paragraph}
        </Text>
      ))}
    </div>
  );
  if (!children) return words;
  return (
    <div className={stacked ? 'docs-topic-block' : 'docs-topic-block docs-figure-split'}>
      {words}
      {children}
    </div>
  );
}

/**
 * A figure that shows envUI at work: its content on the recessed canvas, marked when something in
 * it can be used, with its legend and caption below. `label` names it for assistive technology.
 */
export function Figure({
  label,
  children,
  legend,
  caption,
  className,
}: {
  label: string;
  children: ReactNode;
  legend?: ReactNode;
  caption?: ReactNode;
  className?: string;
}) {
  return (
    <figure className="docs-topic-figure" aria-label={label}>
      <div
        className={['docs-foundation-stage', className].filter(Boolean).join(' ')}
        data-figure="example"
      >
        {children}
        <InteractiveMark />
      </div>
      {(legend || caption) && (
        <figcaption className="docs-anatomy-caption">
          {caption && <p className="docs-figure-caption">{caption}</p>}
          {legend}
        </figcaption>
      )}
    </figure>
  );
}

/** One small picture of a run: envUI at work, with its name and a line on what it shows. */
export interface RunFigure {
  name: string;
  text: string;
  picture: ReactNode;
}

/**
 * Small pictures side by side, each on its own stage with its name and a line under it, such as
 * the kinds of corner or the two scales. The pictures can't be used, so they take no focus.
 */
export function FigureRun({
  figures,
  className,
}: {
  figures: readonly RunFigure[];
  className?: string;
}) {
  return (
    <div className="docs-figure-run" data-count={figures.length}>
      {figures.map((figure) => (
        <figure key={figure.name} className="docs-topic-figure" aria-label={figure.name}>
          <div
            className={['docs-foundation-stage', className].filter(Boolean).join(' ')}
            data-figure="example"
            inert
          >
            {figure.picture}
          </div>
          <figcaption className="docs-topic-text">
            <Text render={<p />} variant="title">
              {figure.name}
            </Text>
            <Text variant="body-sm" emphasis="muted">
              {figure.text}
            </Text>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

/** One entry of a numbered legend: the number its mark shows, a name and what it means. */
export interface LegendEntry {
  name: string;
  text: string;
}

/** A numbered legend under a figure, laid out as an anatomy figure's: each mark's number first. */
export function NumberedLegend({ entries }: { entries: readonly LegendEntry[] }) {
  return (
    <ol className="docs-anatomy-legend docs-topic-legend">
      {entries.map((entry, index) => (
        <li key={entry.name}>
          <span className="docs-anatomy-number" aria-hidden="true">
            {index + 1}
          </span>
          <div>
            <Text render={<p />} className="docs-topic-legend-name">
              {entry.name}
            </Text>
            <Text render={<p />} variant="body-sm" emphasis="muted">
              {entry.text}
            </Text>
          </div>
        </li>
      ))}
    </ol>
  );
}

/**
 * Words with what they mean, laid out as an option legend: each in the tag a variants figure's
 * callouts use, followed by what it is for or what envUI does.
 */
export function TagLegend({
  label,
  entries,
}: {
  label: string;
  entries: readonly { tag: string; text: string }[];
}) {
  return (
    <dl className="docs-option-legend docs-topic-words" aria-label={label}>
      {entries.map((entry) => (
        <div key={entry.tag} className="docs-option">
          <dt>
            <span className="docs-option-tag">{entry.tag}</span>
          </dt>
          <dd>
            <Text render={<p />} emphasis="muted">
              {entry.text}
            </Text>
          </dd>
        </div>
      ))}
    </dl>
  );
}
