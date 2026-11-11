import { createContext, useContext, useLayoutEffect, useRef, type ReactNode } from 'react';
import { Column, Text, type SpaceStep } from '@envsemble/envui';
import { StillMark } from './StillMark';
import { pixelTolerance, remeasure } from '../shared/Remeasure';
import { classNames } from '@envui-internal/internal/classNames';

/**
 * The level of a specimen's title: 2 where the specimen is a section of its own, 3 where it sits in
 * a section of a page. The titles of its parts take the level below.
 */
export const SpecimenHeadingLevel = createContext<2 | 3>(2);

/**
 * The level of the titles of a specimen's parts inside a SpecimenFrame: below its title, or at the
 * specimen's own level where it has none, so no level is skipped. Unset, they take the level below
 * the specimen's.
 */
const PartHeadingLevel = createContext<2 | 3 | 4 | null>(null);

/**
 * The frame of a specimen, or of a foundation's figure drawn from the catalogue's own data: its
 * title and actions, what it shows, and its caption. What it shows is composed from envUI's public
 * components.
 */
export function SpecimenFrame({
  title,
  actions,
  children,
  caption,
  className,
  gap = 4,
  size = 'content',
  still = false,
}: {
  title?: string;
  actions?: ReactNode;
  children: ReactNode;
  caption?: ReactNode;
  className?: string;
  gap?: SpaceStep;
  size?: 'compact' | 'field' | 'content' | 'wide' | 'collection';
  /** Whether it shows the component still, such as in forced states, so it doesn't take input. */
  still?: boolean;
}) {
  const level = useContext(SpecimenHeadingLevel);
  const Heading = `h${level}` as const;
  return (
    <Column
      render={<section />}
      gap={gap}
      data-size={size}
      className={classNames('site-example', className)}
    >
      {title && actions ? (
        <div className="catalogue-example-heading">
          <Text render={<Heading />} variant="headline">
            {title}
          </Text>
          {actions}
        </div>
      ) : title ? (
        <Text render={<Heading />} variant="headline">
          {title}
        </Text>
      ) : null}
      <PartHeadingLevel value={title ? ((level + 1) as 3 | 4) : level}>{children}</PartHeadingLevel>
      {still && <StillMark />}
      {caption && (
        <Text variant="caption" className="catalogue-caption">
          {caption}
        </Text>
      )}
    </Column>
  );
}

/** A titled part of a specimen, such as one state of a matrix, under a small muted label. */
export function SpecimenPart({
  title,
  children,
  caption,
}: {
  title: string;
  children: ReactNode;
  caption?: ReactNode;
}) {
  const specimenLevel = useContext(SpecimenHeadingLevel);
  const level = useContext(PartHeadingLevel) ?? ((specimenLevel + 1) as 3 | 4);
  const Heading = `h${level}` as const;
  return (
    <Column render={<section />} gap={2} className="catalogue-specimen">
      {/* A small muted label, as the state matrix names its rows, quieter than the section's heading. */}
      <Text render={<Heading />} variant="body-sm">
        {title}
      </Text>
      {children}
      {caption && <Text variant="caption">{caption}</Text>}
    </Column>
  );
}

/**
 * Related specimens share a responsive grid; the components keep their own styling. On its own, as
 * a component's specimen, the grid is an example on the recessed canvas (Stage.css); inside a
 * figure, it takes the figure's.
 */
export function SpecimenGrid({
  children,
  size = 'field',
}: {
  children: ReactNode;
  /** small: a run of small pictures, such as drawings, four across, or two where four don't fit. */
  size?: 'small' | 'compact' | 'field' | 'card' | 'wide';
}) {
  return (
    <div className="catalogue-specimen-grid" data-size={size}>
      {children}
    </div>
  );
}

/**
 * A matrix of states, such as each variant in each state, as a table. Where its columns don't fit
 * the page, as on a phone, it lays out one block to a row instead, the row's name over its cells
 * listed down, each named after its column (Examples.css), rather than cut off at the side. As a
 * component's specimen it is an example on the recessed canvas, as SpecimenGrid is.
 */
export function MatrixScroll({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  const area = useRef<HTMLDivElement>(null);
  // Set on the element alone, as it is measured: `data-stacked` where the columns don't fit.
  useLayoutEffect(() => {
    const element = area.current;
    const table = element?.querySelector('table');
    if (!element || !table) return;
    // Each cell named after its column, for the blocks.
    const titles = [...table.querySelectorAll('thead th')].map((cell) => cell.textContent ?? '');
    for (const row of table.querySelectorAll('tbody tr'))
      [...row.children].forEach((cell, index) => {
        if (cell.tagName === 'TD') cell.setAttribute('data-catalogue-label', titles[index] ?? '');
      });
    // Laid out as a table, whether a cell's content runs past its column.
    const stack = () => {
      element.removeAttribute('data-stacked');
      const cells = [...table.querySelectorAll<HTMLElement>('th, td')];
      if (cells.some((cell) => cell.scrollWidth > cell.clientWidth + 1))
        element.setAttribute('data-stacked', '');
    };
    // Measured at once, then again at another width, and once the fonts have loaded, which lay
    // the cells out anew at the same width.
    let width = -1;
    const widths = remeasure(
      (changed) => {
        const next = element.getBoundingClientRect().width;
        if (!changed.has('fonts') && Math.abs(next - width) < pixelTolerance) return;
        width = next;
        stack();
      },
      { first: 'now', resize: [element], fonts: true },
    );
    return widths.stop;
  }, []);
  return (
    <div
      ref={area}
      className={classNames('catalogue-matrix-scroll', className)}
      role="region"
      aria-label={label}
    >
      {children}
    </div>
  );
}
