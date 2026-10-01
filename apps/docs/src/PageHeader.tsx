import type { ReactNode } from 'react';
import { Card, Stack, Text } from '@envsemble/envui';

/** Documentation composition; card geometry and text styles come from the library. */
export function PageHeader({
  title,
  breadcrumb,
  summary,
  children,
  actions,
}: {
  title: string;
  breadcrumb?: string;
  summary?: string;
  children?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="docs-page-header">
      <Card className="docs-page-header-card">
        <Stack gap={3}>
          {breadcrumb && <Text variant="caption">{breadcrumb}</Text>}
          <Text as="h1" variant="page-heading">
            {title}
          </Text>
          {summary && <Text tone="muted">{summary}</Text>}
        </Stack>
        {children}
      </Card>
      {actions}
    </header>
  );
}
