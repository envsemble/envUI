import { Column, Text } from '@envsemble/envui';
import { SiteBanner } from '../frame/SiteBanner';
import { catalogueTrail, docsTrail } from '../routes/Trails';
import type { RoutePage } from '../routes/SiteRoutes';
import { PartSwitch } from '../routes/OtherPart';
import { PartSkeleton, placeholderText } from '../loading/Skeletons';
import { recordedSize } from '../loading/RecordedSizes';
import { MetadataBadges } from '../template/MetadataBadges';
import { partKey } from '../documentation/PartKeys';

const exampleHeightRem = 12;
const stagePaddingRem = 5;
const stageLeastRem = 11;
const overviewLeast = 'clamp(16rem, 42cqi, 30rem)';

function CatalogueSection({ page }: { page: RoutePage }) {
  const firstSection = page.document?.outline?.[0];
  const opensWithFigure = firstSection?.id === 'overview';
  const example = firstSection?.examples[0];
  const size =
    example && page.document && recordedSize(partKey('example', page.document.id, example.name));
  return (
    <div className="site-section-groups">
      <Column gap={4} render={<section />} className="site-article site-section-group">
        {!opensWithFigure && (
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
              blockSize: `max(${Math.max(stageLeastRem, (size?.[1] ?? exampleHeightRem) + stagePaddingRem)}rem, ${opensWithFigure ? overviewLeast : '0rem'})`,
            }}
          />
        )}
      </Column>
    </div>
  );
}

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
