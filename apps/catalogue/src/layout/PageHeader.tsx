import type { ReactNode } from 'react';
import { Card, Column, Text } from '@envsemble/envui';
import { BannerShapes } from './BannerShapes';

/**
 * The kinds of banner (Banners.css): a landing page's of the Site, such as All components, on a
 * tint with outlined shapes along both ends; any other page's of the Site, quieter, with a few
 * shapes at its start and the page's icon at its end; and a page's of the Docs, the developer
 * reference, read from the start like a document, the envUI mark's shapes drawn as outlines.
 */
export type BannerKind = 'landing' | 'page' | 'docs-home' | 'docs';

/** Documentation banner composed from the library's card, text and layout primitives. */
export function PageHeader({
  title,
  breadcrumb,
  description,
  meta,
  symbol,
  children,
  actions,
  kind = 'page',
}: {
  title: string;
  breadcrumb?: string;
  description?: string;
  /** Facts about the page under its description, such as a component's status. */
  meta?: ReactNode;
  symbol?: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
  kind?: BannerKind;
}) {
  return (
    <header className="docs-page-header">
      <Card
        background="default"
        padding={6}
        className="docs-page-banner docs-banner"
        data-banner={kind}
      >
        <BannerShapes kind={kind === 'docs-home' ? 'docs' : kind} icon={Boolean(symbol)} />
        {symbol && kind === 'page' && (
          <span className="docs-page-banner-symbol" aria-hidden="true">
            {symbol}
          </span>
        )}
        <Column gap={6} align="center" className="docs-page-banner-content">
          <div className="docs-page-banner-heading">
            <Column gap={3} align="center">
              {breadcrumb && (
                <Text variant="caption" className="docs-page-banner-breadcrumb">
                  {breadcrumb}
                </Text>
              )}
              <Text render={<h1 />} variant="headline" className="docs-page-banner-title">
                {title}
              </Text>
              {description && (
                <Text emphasis="muted" className="docs-page-banner-description">
                  {description}
                </Text>
              )}
              {meta}
            </Column>
            {actions}
          </div>
          {children}
        </Column>
      </Card>
    </header>
  );
}
