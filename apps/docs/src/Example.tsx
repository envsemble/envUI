import type { ReactNode } from 'react';
import { Stack, Text, type SpaceStep } from '@envsemble/envui';

/** Documentation specimen framing; product UI is composed from public envUI components. */
export function Example({
  title,
  children,
  caption,
  className,
  gap = 4,
  size = 'content',
}: {
  title: string;
  children: ReactNode;
  caption?: string;
  className?: string;
  gap?: SpaceStep;
  size?: 'compact' | 'field' | 'content' | 'wide' | 'collection';
}) {
  return (
    <Stack
      as="section"
      gap={gap}
      data-size={size}
      className={['docs-example', className].filter(Boolean).join(' ')}
    >
      <Text as="h2" variant="page-heading">
        {title}
      </Text>
      {children}
      {caption && (
        <Text variant="caption" className="docs-caption">
          {caption}
        </Text>
      )}
    </Stack>
  );
}

/** Related specimens share a responsive grid; the components keep their own styling. */
export function SpecimenGrid({
  children,
  size = 'field',
}: {
  children: ReactNode;
  size?: 'compact' | 'field' | 'card';
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
  caption?: string;
}) {
  return (
    <Stack as="section" gap={3}>
      <Text as="h3" variant="section-heading">
        {title}
      </Text>
      {children}
      {caption && <Text variant="caption">{caption}</Text>}
    </Stack>
  );
}
