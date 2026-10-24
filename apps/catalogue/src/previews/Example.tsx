import { createContext, useContext, type ReactNode } from 'react';
import { Column, Text, type SpaceStep } from '@envsemble/envui';
import { ExampleTheme, ExplanationScope, useFigureKind } from '../template/ExampleTheme';

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
  stage,
  explains = false,
}: {
  title?: string;
  actions?: ReactNode;
  children: ReactNode;
  caption?: ReactNode;
  className?: string;
  gap?: SpaceStep;
  size?: 'compact' | 'field' | 'content' | 'wide' | 'collection';
  /** `none` leaves the stage's fill out, where the subject is a color, such as a swatch. */
  stage?: 'none';
  /**
   * Whether the figure explains the system, such as a scale of tokens, rather than shows envUI at
   * work: it then stays in the catalogue's theme, where an example takes the opposite one.
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
      data-stage={stage}
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
        {staged && (explains || stage === 'none') ? (
          <ExplanationScope>
            <div className="docs-foundation-stage" data-figure="explanation" data-stage={stage}>
              {children}
            </div>
          </ExplanationScope>
        ) : staged ? (
          <ExampleTheme className="docs-foundation-stage" data-figure="example">
            {children}
          </ExampleTheme>
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
 * a component's specimen, the grid is an example in the theme opposite the catalogue's; inside a
 * figure, it takes the figure's.
 */
export function SpecimenGrid({
  children,
  size = 'field',
}: {
  children: ReactNode;
  size?: 'compact' | 'field' | 'card' | 'wide';
}) {
  const kind = useFigureKind();
  if (kind === 'none')
    return (
      <ExampleTheme className="docs-specimen-grid" data-size={size}>
        {children}
      </ExampleTheme>
    );
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
 * component's specimen it is an example in the theme opposite the catalogue's, as SpecimenGrid is.
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
  const kind = useFigureKind();
  const props = {
    className: ['docs-matrix-scroll', className].filter(Boolean).join(' '),
    tabIndex: 0,
    role: 'region',
    'aria-label': label,
  };
  return kind === 'none' ? (
    <ExampleTheme {...props}>{children}</ExampleTheme>
  ) : (
    <div {...props}>{children}</div>
  );
}
