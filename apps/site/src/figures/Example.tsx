import { createContext, useContext, useLayoutEffect, useRef, type ReactNode } from 'react';
import { Column, Text, type SpaceStep } from '@envsemble/envui';

/**
 * The level of a specimen's title: 2 where the specimen is a section of its own, 3 where it sits in
 * a section of a page. The titles of its parts take the level below.
 */
export const SpecimenHeadingLevel = createContext<2 | 3>(2);

/**
 * The level of the titles of a specimen's parts inside an Example: below its title, or at the
 * specimen's own level where it has none, so no level is skipped. Unset, they take the level below
 * the specimen's.
 */
const PartHeadingLevel = createContext<2 | 3 | 4 | null>(null);

/**
 * Whether an Example shows its content on a stage, as a foundation page's preview does; its caption
 * stays below the stage.
 */
export const ExampleStage = createContext(false);

/** A foundation's figure that shows envUI at work, on its stage. */
function FoundationStage({ children }: { children: ReactNode }) {
  return (
    <div className="site-foundation-stage" data-figure="example">
      {children}
    </div>
  );
}

/** Documentation specimen framing; product UI is composed from public envUI components. */
export function Example({
  title,
  actions,
  children,
  caption,
  className,
  gap = 4,
  size = 'content',
  explains = false,
}: {
  title?: string;
  actions?: ReactNode;
  children: ReactNode;
  caption?: ReactNode;
  className?: string;
  gap?: SpaceStep;
  size?: 'compact' | 'field' | 'content' | 'wide' | 'collection';
  /**
   * Whether the figure explains the system, such as a scale of tokens or the palette, rather than
   * shows envUI at work: it then sits on the page itself, under its title and in line with the
   * text, rather than on the recessed canvas of an example.
   */
  explains?: boolean;
}) {
  const level = useContext(SpecimenHeadingLevel);
  const Heading = `h${level}` as const;
  const staged = useContext(ExampleStage);
  return (
    <Column
      render={<section />}
      gap={gap}
      data-size={size}
      className={['site-example', className].filter(Boolean).join(' ')}
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
      <PartHeadingLevel value={title ? ((level + 1) as 3 | 4) : level}>
        {staged && explains ? (
          <div className="site-foundation-stage" data-figure="explanation">
            {children}
          </div>
        ) : staged ? (
          <FoundationStage>{children}</FoundationStage>
        ) : (
          children
        )}
      </PartHeadingLevel>
      {caption && (
        <Text variant="caption" className="catalogue-caption">
          {caption}
        </Text>
      )}
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

export function Specimen({
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
    <Column render={<section />} gap={3} className="catalogue-specimen">
      <Text render={<Heading />} variant="title">
        {title}
      </Text>
      {children}
      {caption && <Text variant="caption">{caption}</Text>}
    </Column>
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
    let width = -1;
    const observer = new ResizeObserver(([entry]) => {
      const next = entry?.contentRect.width ?? 0;
      if (Math.abs(next - width) < 0.5) return;
      width = next;
      stack();
    });
    observer.observe(element);
    void document.fonts?.ready.then(stack);
    return () => observer.disconnect();
  }, []);
  return (
    <div
      ref={area}
      className={['catalogue-matrix-scroll', className].filter(Boolean).join(' ')}
      role="region"
      aria-label={label}
    >
      {children}
    </div>
  );
}
