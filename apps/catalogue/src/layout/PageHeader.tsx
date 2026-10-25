import type { ReactNode } from 'react';
import { Breadcrumbs, Card, Column, Text } from '@envsemble/envui';
import { routeHref } from '../navigation/Address';
import type { TrailStep } from '../navigation/DocumentationRoutes';
import { BannerMotif, type BannerSubject } from './BannerMotif';
import { BannerShapes } from './BannerShapes';

/**
 * The kinds of banner, each read from the start like a document, under its breadcrumbs
 * (Banners.css): a page's of the catalogue, on a fill, with a motif drawn from what the page shows
 * at its end (BannerMotif.tsx); and a page's of the Docs, the developer reference, on the page's
 * color inside an edge, the envUI mark's shapes drawn as outlines at its end.
 */
export type BannerKind = 'catalogue' | 'docs-home' | 'docs';

/** Documentation banner composed from the library's card, text and layout primitives. */
export function PageHeader({
  title,
  breadcrumb,
  trail,
  description,
  meta,
  symbol,
  subject,
  logo,
  children,
  actions,
  kind = 'catalogue',
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
  /** The page's icon, which a catalogue banner's motif falls back to. */
  symbol?: ReactNode;
  /** What a catalogue page shows, which picks the motif at its banner's end. */
  subject?: BannerSubject;
  /** Artwork shown as the title, such as a lockup; the title stays its accessible name. */
  logo?: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
  kind?: BannerKind;
}) {
  const docs = kind !== 'catalogue';
  return (
    <header className="docs-page-header">
      <Card
        background="default"
        padding={6}
        className="docs-page-banner docs-banner"
        data-banner={kind}
      >
        {docs ? <BannerShapes /> : <BannerMotif subject={subject} symbol={symbol} />}
        <Column gap={6} className="docs-page-banner-content">
          <div className="docs-page-banner-heading">
            <Column gap={3}>
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
