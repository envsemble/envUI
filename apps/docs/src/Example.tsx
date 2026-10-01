import type { ReactNode } from 'react';
import { Stack, Text, type SpaceStep } from '@envsemble/envui';

/** Documentation specimen framing; product UI is composed from public envUI components. */
export function Example({
  title,
  children,
  caption,
  className,
  gap = 4,
}: {
  title: string;
  children: ReactNode;
  caption?: string;
  className?: string;
  gap?: SpaceStep;
}) {
  return (
    <Stack as="section" gap={gap} className={['docs-example', className].filter(Boolean).join(' ')}>
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
