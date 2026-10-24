import type { ReactNode } from 'react';
import { Card, Column, Text } from '@envsemble/envui';
import { BannerShapes } from './BannerShapes';

/**
 * The kinds of banner: a page's of the Site, the plain banner with the page's icon large and faint
 * at its end (Shell.css); and a page's of the Docs, the developer reference, read from the start like
 * a document, the envUI mark's shapes drawn as outlines (Banners.css).
 */
export type BannerKind = 'site' | 'docs-home' | 'docs';

/** Documentation banner composed from the library's card, text and layout primitives. */
export function PageHeader({
  title,
  breadcrumb,
  description,
  meta,
  symbol,
  children,
  actions,
  kind = 'site',
}: {
  title: string;
  breadcrumb?: string;
  description?: string;
  /** Facts about the page under its description, such as a component's status. */
  meta?: ReactNode;
  /** The page's icon, drawn large and faint at the end of a Site banner. */
  symbol?: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
  kind?: BannerKind;
}) {
  const docs = kind !== 'site';
  return (
    <header className="docs-page-header">
      <Card
        background="default"
        padding={6}
        className={docs ? 'docs-page-banner docs-banner' : 'docs-page-banner'}
        data-banner={docs ? kind : undefined}
      >
        {docs && <BannerShapes />}
        {symbol && !docs && (
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
