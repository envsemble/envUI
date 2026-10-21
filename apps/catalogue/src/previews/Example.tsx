import { createContext, useContext, type ReactNode } from 'react';
import { Column, Text, type SpaceStep } from '@envsemble/envui';

/**
 * The level of a specimen's title: 2 where the specimen is a section of its own, 3 where it sits in
 * a section of a page of exchanges. The titles of its parts take the level below.
 */
export const SpecimenHeadingLevel = createContext<2 | 3>(2);

/** Documentation specimen framing; product UI is composed from public envUI components. */
export function Example({
  title,
  actions,
  children,
  caption,
  className,
  gap = 4,
  size = 'content',
}: {
  title?: string;
  actions?: ReactNode;
  children: ReactNode;
  caption?: ReactNode;
  className?: string;
  gap?: SpaceStep;
  size?: 'compact' | 'field' | 'content' | 'wide' | 'collection';
}) {
  const Heading = `h${useContext(SpecimenHeadingLevel)}` as const;
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
      {children}
      {caption && (
        <Text variant="caption" className="docs-caption">
          {caption}
        </Text>
      )}
    </Column>
  );
}

/** Related specimens share a responsive grid; the components keep their own styling. */
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
  const Heading = useContext(SpecimenHeadingLevel) === 3 ? 'h4' : 'h3';
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
