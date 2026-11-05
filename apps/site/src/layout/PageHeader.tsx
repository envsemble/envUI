import type { ReactNode } from 'react';
import { Breadcrumbs, Card, Column, Text } from '@envsemble/envui';
import { routeHref } from '../navigation/Address';
import type { TrailStep } from '../navigation/SiteRoutes';
import { BannerMotif, motifOf } from './BannerMotif';
import { CatalogueBannerLines } from './CatalogueBannerLines';
import { DocsBannerLines } from './DocsBannerLines';
import { CompactContents } from './PageContents';

/**
 * The kinds of banner, one card that reads from the start like a document, under its breadcrumbs,
 * with a LineArt drawing at its end (Banners.css): a catalogue page's drawing draws itself in, or
 * for the few with one is a motif drawn from what the page shows (BannerMotif.tsx); a Docs page's
 * is the same drawing, still.
 */
export type BannerKind = 'catalogue' | 'docs';

/** Documentation banner composed from the library's card, text and layout primitives. */
export function PageHeader({
  title,
  breadcrumb,
  trail,
  description,
  meta,
  subject,
  children,
  actions,
  corner,
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
  children?: ReactNode;
  actions?: ReactNode;
  /** What sits over the banner's top end corner, such as the Design | Code switch. */
  corner?: ReactNode;
  kind?: BannerKind;
}) {
  const motif = kind === 'catalogue' ? motifOf(subject) : undefined;
  return (
    <header className="site-page-header">
      <Card background="default" padding={6} className="site-page-banner site-banner">
        {motif ? (
          <BannerMotif motif={motif} />
        ) : kind === 'catalogue' ? (
          <CatalogueBannerLines subject={subject} />
        ) : (
          <DocsBannerLines title={title} />
        )}
        <Column gap={6} className="site-page-banner-content">
          <div className="site-page-banner-heading">
            <Column gap={3}>
              {trail ? (
                <Breadcrumbs
                  className="site-page-banner-breadcrumbs"
                  // One line in a narrow banner too: the page's own name, the title below, is cut
                  // short first.
                  wrap={false}
                  items={trail.map(({ label, route }) => ({
                    label,
                    href: route === undefined ? undefined : routeHref(route),
                  }))}
                />
              ) : (
                breadcrumb && (
                  <Text variant="caption" className="catalogue-page-banner-breadcrumb">
                    {breadcrumb}
                  </Text>
                )
              )}
              <Text render={<h1 />} variant="headline" className="site-page-banner-title">
                {title}
              </Text>
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
        {corner && <div className="site-page-banner-corner">{corner}</div>}
      </Card>
      <CompactContents />
    </header>
  );
}
