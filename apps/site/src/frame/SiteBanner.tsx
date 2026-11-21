import { Breadcrumbs, Link, Text, type BreadcrumbsItem } from '@envsemble/envui';
import { IconHistory } from '@envsemble/envui/icons/History';
import { IconHome } from '@envsemble/envui/icons/Home';
import { IconMenuBook } from '@envsemble/envui/icons/MenuBook';
import { IconPalette } from '@envsemble/envui/icons/Palette';
import { IconRocketLaunch } from '@envsemble/envui/icons/RocketLaunch';
import { IconSchool } from '@envsemble/envui/icons/School';
import { IconWidgets } from '@envsemble/envui/icons/Widgets';
import type { PageStatus } from '../documentation/DocumentationTypes';
import { routeHref } from '../routes/Address';
import { PartSwitch } from '../routes/OtherPart';
import type { RoutePage } from '../routes/SiteRoutes';
import type { TrailStep } from '../routes/Trails';

type BannerKind = 'catalogue' | 'docs';

type SectionIcon = typeof IconHome;

const sectionIcons: Record<string, SectionIcon> = {
  Overview: IconHome,
  Foundations: IconPalette,
  Components: IconWidgets,
  'Get started': IconRocketLaunch,
  Guides: IconSchool,
  Changelog: IconHistory,
};

const changelogHref = routeHref('docs/changelog');

const statusWord = (status: PageStatus) => status[0].toUpperCase() + status.slice(1);

function crumbsOf(
  trail: readonly TrailStep[],
  Icon: SectionIcon,
  section: string | undefined,
): BreadcrumbsItem[] {
  const iconAt = Math.max(
    0,
    trail.findIndex((step) => step.label === section),
  );
  return trail.map(({ label, route }, index) => ({
    label:
      index === iconAt ? (
        <span className="site-crumb">
          <Icon className="site-crumb-icon" />
          {label}
        </span>
      ) : (
        label
      ),
    href: route === undefined ? undefined : routeHref(route),
  }));
}

function PageState({ page }: { page: RoutePage }) {
  const status = page.document?.metadata?.status ?? page.document?.status;
  const since = page.document?.metadata?.since;
  if (!status && !since) return null;
  return (
    <Text variant="body-sm" emphasis="muted" render={<p />} className="site-banner-state">
      {status && (
        <span className="site-status" data-status={status}>
          <span className="site-status-glyph" aria-hidden="true" />
          {statusWord(status)}
        </span>
      )}
      {since && (
        <span className="site-banner-since">
          Since{' '}
          <Link href={changelogHref} underline={false} className="site-banner-since-link">
            {since}
          </Link>
        </span>
      )}
    </Text>
  );
}

export function SiteBanner({
  title,
  breadcrumb,
  trail,
  description,
  page,
  kind = 'catalogue',
}: {
  title: string;
  breadcrumb?: string;
  trail?: readonly TrailStep[];
  description?: string;
  page?: RoutePage;
  kind?: BannerKind;
}) {
  const Icon = (page && sectionIcons[page.section]) ?? (kind === 'docs' ? IconMenuBook : IconHome);
  return (
    <header className="site-page-header">
      <div className="site-banner">
        <div className="site-banner-trail-row">
          {trail ? (
            <Breadcrumbs
              className="site-banner-trail"
              wrap={false}
              items={crumbsOf(trail, Icon, page?.section)}
            />
          ) : (
            breadcrumb && (
              <Text variant="body-sm" emphasis="muted" className="site-banner-trail">
                {breadcrumb}
              </Text>
            )
          )}
          {page && <PartSwitch page={page} />}
        </div>
        <Text render={<h1 />} variant="headline" className="site-banner-title">
          {title}
        </Text>
        {description && <Text className="site-banner-lead">{description}</Text>}
        {page && <PageState page={page} />}
      </div>
    </header>
  );
}
