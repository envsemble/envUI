import type { ReactNode } from 'react';
import { Card, Stack, Text } from '@envsemble/envui';

/** Documentation banner composed from the library's card, text and layout primitives. */
export function PageHeader({
  title,
  breadcrumb,
  children,
  actions,
}: {
  title: string;
  breadcrumb?: string;
  children?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="docs-page-header">
      <Card tone="pane" padding={6} className="docs-page-banner">
        <div className="docs-page-banner-heading">
          <Stack gap={3}>
            {breadcrumb && <Text variant="caption">{breadcrumb}</Text>}
            <Text as="h1" variant="page-heading">
              {title}
            </Text>
          </Stack>
          {actions}
        </div>
        {children}
      </Card>
    </header>
  );
}
