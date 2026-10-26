import type { ReactNode } from 'react';
import { Breadcrumbs, Card, Column, Text } from '@envsemble/envui';
import { routeHref } from '../navigation/Address';
import type { TrailStep } from '../navigation/SiteRoutes';
import { BannerMotif, motifOf } from './BannerMotif';
import { BannerShapes } from './BannerShapes';
import { CatalogueBannerLines } from './CatalogueBannerLines';

/**
 * The kinds of banner, each read from the start like a document, under its breadcrumbs, the envUI
 * mark's shapes at its end (Banners.css): a page's of the catalogue on a fill, its shapes filled,
 * or for the few with one a motif drawn from what the page shows (BannerMotif.tsx); and a page's
 * of the Docs, the developer reference, on the page's color inside an edge, its shapes in outline.
 */
export type BannerKind = 'catalogue' | 'docs-home' | 'docs';

/** Documentation banner composed from the library's card, text and layout primitives. */
export function PageHeader({
  title,
  breadcrumb,
  trail,
  description,
  meta,
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
  /** The id of what a catalogue page shows, which gives the few that have one their motif. */
  subject?: string;
  /** Artwork shown as the title, such as a lockup; the title stays its accessible name. */
  logo?: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
  kind?: BannerKind;
}) {
  const motif = kind === 'catalogue' ? motifOf(subject) : undefined;
  return (
    <header className="site-page-header">
      <Card
        background="default"
        padding={6}
        className="site-page-banner site-banner"
        data-banner={kind}
      >
        {motif ? (
          <BannerMotif motif={motif} />
        ) : kind === 'catalogue' ? (
          <CatalogueBannerLines subject={subject} />
        ) : (
          <BannerShapes />
        )}
        <Column gap={6} className="site-page-banner-content">
          <div className="site-page-banner-heading">
            <Column gap={3}>
              {trail ? (
                <Breadcrumbs
                  className="site-page-banner-breadcrumbs"
                  items={trail.map(({ label, route }) => ({ label, href: routeHref(route) }))}
                />
              ) : (
                breadcrumb && (
                  <Text variant="caption" className="catalogue-page-banner-breadcrumb">
                    {breadcrumb}
                  </Text>
                )
              )}
              {logo ? (
                <Text render={<h1 />} aria-label={title} className="docs-page-banner-logo">
                  {logo}
                </Text>
              ) : (
                <Text render={<h1 />} variant="headline" className="site-page-banner-title">
                  {title}
                </Text>
              )}
              {description && (
                <Text emphasis="muted" className="site-page-banner-description">
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
