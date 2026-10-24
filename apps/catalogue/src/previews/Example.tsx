import { createContext, useContext, type ReactNode } from 'react';
import { Column, Text, type SpaceStep } from '@envsemble/envui';

/**
 * The level of a specimen's title: 2 where the specimen is a section of its own, 3 where it sits in
 * a section of a page on the figure template. The titles of its parts take the level below.
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
      className={['docs-example', className].filter(Boolean).join(' ')}
    >
      {title && actions ? (
        <div className="docs-example-heading">
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
        {staged ? (
          <div className="docs-foundation-stage" data-figure={explains ? 'explanation' : 'example'}>
            {children}
          </div>
        ) : (
          children
        )}
      </PartHeadingLevel>
      {caption && (
        <Text variant="caption" className="docs-caption">
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
  size?: 'compact' | 'field' | 'card' | 'wide';
}) {
  return (
    <div className="docs-specimen-grid" data-size={size}>
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
    <Column render={<section />} gap={3} className="docs-specimen">
      <Text render={<Heading />} variant="title">
        {title}
      </Text>
      {children}
      {caption && <Text variant="caption">{caption}</Text>}
    </Column>
  );
}

/**
 * A matrix of states that scrolls sideways where it is wider than the page, by keyboard too. As a
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
  return (
    <div
      className={['docs-matrix-scroll', className].filter(Boolean).join(' ')}
      tabIndex={0}
      role="region"
      aria-label={label}
    >
      {children}
    </div>
  );
}
