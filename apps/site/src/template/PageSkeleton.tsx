import { Column, Text } from '@envsemble/envui';
import { SiteBanner } from '../layout/SiteBanner';
import { catalogueTrail, docsTrail } from '../navigation/Trails';
import type { RoutePage } from '../navigation/SiteRoutes';
import { PartSwitch } from '../navigation/OtherPart';
import { PartSkeleton, placeholderText, recordedSize } from './Loading';
import { MetadataBadges } from './TemplateContent';

/**
 * An example's height where its size wasn't recorded, the stage's room around it and its least
 * height, in rem (Stage.css); the overview's least height, which follows the column's width.
 */
const exampleHeight = 12;
const stagePadding = 5;
const stageLeast = 11;
const overviewLeast = 'clamp(16rem, 42cqi, 30rem)';

/**
 * The first section of a page of the catalogue as it loads: its heading, its lead and its first
 * figure's stage, at the size recorded for its example. Overview shows its figure alone, its heading
 * being for the contents alone (TemplateContent.tsx).
 */
function CatalogueSection({ page }: { page: RoutePage }) {
  const first = page.document?.outline?.[0];
  const example = first?.examples[0];
  const size = example && recordedSize(`example:${page.document!.id}/${example.name}`);
  return (
    // The page's own classes for its sections' room and type, not for what is in them, which the
    // page's checks look for.
    <div className="site-section-groups">
      <Column gap={4} render={<section />} className="site-article site-section-group">
        {/* Overview opens with its figure; another section with its heading and its lead. */}
        {first?.id !== 'overview' && (
          <>
            <Text render={<h2 />} variant="headline">
              {placeholderText(8)}
            </Text>
            <Text render={<p />} className="site-page-skeleton-lead">
              {placeholderText(150)}
            </Text>
          </>
        )}
        {example && (
          <div
            className="site-page-skeleton-stage"
            style={{
              blockSize: `max(${Math.max(stageLeast, (size?.[1] ?? exampleHeight) + stagePadding)}rem, ${first?.id === 'overview' ? overviewLeast : '0rem'})`,
            }}
          />
        )}
      </Column>
    </div>
  );
}

/**
 * The start of a page of the Docs as it loads: a component's opens with its import, a heading over
 * its code, then its usage; a guide with a heading over its text.
 */
function DocsSection({ code }: { code: boolean }) {
  return (
    <Column gap={8} className="site-article">
      {code && (
        <Column gap={5} render={<section />}>
          <Text render={<h2 />} variant="headline">
            {placeholderText(6)}
          </Text>
          <div className="site-page-skeleton-code" />
        </Column>
      )}
      <Column gap={5} render={<section />}>
        <Text render={<h2 />} variant="headline">
          {placeholderText(code ? 5 : 12)}
        </Text>
        <Text render={<p />}>{placeholderText(180)}</Text>
        <Text render={<p />}>{placeholderText(220)}</Text>
      </Column>
    </Column>
  );
}

/**
 * A page while its content loads, where nothing of it is there to keep, such as one gone back to,
 * or opened from search, that hasn't loaded yet: envUI's skeleton in the page's shape, its banner
 * with its title and summary, then its first section's heading, text and figure or code, as bars
 * and shapes. As every part's skeleton, it shows once the load has taken a moment, keeping its
 * space meanwhile, and is a busy region whose content assistive technology skips, with the page's
 * one status saying the page is loading (template/Loading.tsx). A link keeps the page before until
 * the next has loaded, so it never shows this.
 */
export function PageSkeleton({ page }: { page: RoutePage }) {
  const docs = page.area === 'docs';
  return (
    <PartSkeleton what="page" className="site-page-skeleton">
      <SiteBanner
        title={page.title}
        trail={docs ? docsTrail(page) : catalogueTrail(page)}
        description={page.summary}
        kind={docs ? 'docs' : 'catalogue'}
        meta={
          <MetadataBadges
            metadata={page.document?.metadata ?? { status: page.document?.status }}
            plain={!docs}
          />
        }
        corner={<PartSwitch page={page} />}
      />
      {docs ? <DocsSection code={page.kind === 'reference'} /> : <CatalogueSection page={page} />}
    </PartSkeleton>
  );
}
