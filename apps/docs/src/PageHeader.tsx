import type { ReactNode } from 'react';
import { Card, Stack, Text } from '@envsemble/envui';

/** Documentation composition; card geometry and text styles come from the library. */
export function PageHeader({
  title,
  breadcrumb,
  summary,
  children,
}: {
  title: string;
  breadcrumb?: string;
  summary?: string;
  children?: ReactNode;
}) {
  return (
    <header className="docs-page-header">
      <Card>
        <Stack gap={3}>
          {breadcrumb && <Text variant="caption">{breadcrumb}</Text>}
          <Text as="h1" variant="page-heading">
            {title}
          </Text>
          {summary && <Text tone="muted">{summary}</Text>}
        </Stack>
        {children}
      </Card>
    </header>
  );
}
