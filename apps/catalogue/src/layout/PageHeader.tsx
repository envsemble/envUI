import type { ReactNode } from 'react';
import { Breadcrumbs, Card, Column, Text } from '@envsemble/envui';
import { routeHref } from '../navigation/Address';
import type { TrailStep } from '../navigation/DocumentationRoutes';
import { BannerShapes } from './BannerShapes';

/**
 * The kinds of banner: a page's of the Usage guide, the plain banner with the page's icon large and
 * faint at its end (Shell.css); and a page's of the Docs, the developer reference, read from the
 * start like a document, under its breadcrumbs, the envUI mark's shapes drawn as outlines
 * (Banners.css).
 */
export type BannerKind = 'usage' | 'docs-home' | 'docs';

/** Documentation banner composed from the library's card, text and layout primitives. */
export function PageHeader({
  title,
  breadcrumb,
  trail,
  description,
  meta,
  symbol,
  logo,
  children,
  actions,
  kind = 'usage',
}: {
  title: string;
  /** Where the page is, as a quiet line above the title, such as Components / Actions. */
  breadcrumb?: string;
  /**
   * The trail from the part's home to the page, as breadcrumbs above the title in place of
   * `breadcrumb`, such as Docs / Components / Actions / Button.
   */
  trail?: readonly TrailStep[];
  description?: string;
  /** Facts about the page under its description, such as a component's status. */
  meta?: ReactNode;
  /** The page's icon, drawn large and faint at the end of a Usage guide banner. */
  symbol?: ReactNode;
  /** Artwork shown as the title, such as a lockup; the title stays its accessible name. */
  logo?: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
  kind?: BannerKind;
}) {
  const docs = kind !== 'usage';
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
              {trail ? (
                <Breadcrumbs
                  className="docs-page-banner-breadcrumbs"
                  items={trail.map(({ label, route }) => ({ label, href: routeHref(route) }))}
                />
              ) : (
                breadcrumb && (
                  <Text variant="caption" className="docs-page-banner-breadcrumb">
                    {breadcrumb}
                  </Text>
                )
              )}
              {logo ? (
                <Text render={<h1 />} aria-label={title} className="docs-page-banner-logo">
                  {logo}
                </Text>
              ) : (
                <Text render={<h1 />} variant="headline" className="docs-page-banner-title">
                  {title}
                </Text>
              )}
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
