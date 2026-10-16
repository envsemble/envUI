import type { ReactNode } from 'react';
import { Card, Stack, Text } from '@envsemble/envui';

/** Documentation banner composed from the library's card, text and layout primitives. */
export function PageHeader({
  title,
  breadcrumb,
  description,
  meta,
  symbol,
  children,
  actions,
}: {
  title: string;
  breadcrumb?: string;
  description?: string;
  /** Facts about the page under its description, such as a component's status. */
  meta?: ReactNode;
  symbol?: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="docs-page-header">
      <Card tone="pane" padding={6} className="docs-page-banner">
        {symbol && (
          <span className="docs-page-banner-symbol" aria-hidden="true">
            {symbol}
          </span>
        )}
        <Stack gap={6} align="center" className="docs-page-banner-content">
          <div className="docs-page-banner-heading">
            <Stack gap={3} align="center">
              {breadcrumb && <Text variant="caption">{breadcrumb}</Text>}
              <Text render={<h1 />} variant="headline" className="docs-page-banner-title">
                {title}
              </Text>
              {description && (
                <Text emphasis="muted" className="docs-page-banner-description">
                  {description}
                </Text>
              )}
              {meta}
            </Stack>
            {actions}
          </div>
          {children}
        </Stack>
      </Card>
    </header>
  );
}
