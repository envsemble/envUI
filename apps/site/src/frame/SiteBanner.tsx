import type { ReactNode } from 'react';
import { Breadcrumbs, Card, Column, Text } from '@envsemble/envui';
import { routeHref } from '../routes/Address';
import type { TrailStep } from '../routes/Trails';
import { BannerMotif, motifOf } from './BannerMotif';
import { CompactContents } from './PageContents';

type BannerKind = 'catalogue' | 'docs';

export function SiteBanner({
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
  breadcrumb?: string;
  trail?: readonly TrailStep[];
  description?: string;
  meta?: ReactNode;
  subject?: string;
  children?: ReactNode;
  actions?: ReactNode;
  corner?: ReactNode;
  kind?: BannerKind;
}) {
  const motif = kind === 'catalogue' ? motifOf(subject) : undefined;
  return (
    <header className="site-page-header">
      <Card background="default" padding={6} className="site-page-banner site-banner">
        {motif && <BannerMotif motif={motif} />}
        <Column gap={6} className="site-page-banner-content">
          <div className="site-page-banner-heading">
            <Column gap={3}>
              {trail ? (
                <Breadcrumbs
                  className="site-page-banner-breadcrumbs"
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
