import { Link, Column, Text } from '@envsemble/envui';
import { Documentation } from './Documentation';
import {
  pageHref,
  referencePages,
  type ReferencePage,
  type ReferenceView,
} from '../navigation/DocumentationRoutes';
import { FoundationPreview } from '../previews/FoundationPreview';
import { ComponentPreview } from '../previews/ComponentPreview';
import { PageViews } from '../layout/PageViews';
import { Suspense, useState } from 'react';
import type { Reference } from '../Reference';
import { getReferenceIcon } from '../navigation/TopicIcons';
import { TemplateContent, TemplateMeta } from '../template/TemplateContent';
import { LoadBoundary, lazyPart } from '../template/LoadBoundary';
import { navigate, routeHref } from '../navigation/Address';

/** How to use the icon a reader chose in the icon list, which loads with the page that shows it. */
const iconUsage = lazyPart(
  () => import('../usage/IconUsage'),
  (module) => module.IconUsageDetails,
  'src/usage/IconUsage.tsx',
);

function IconUsage({ name, filled }: { name: string | null; filled: boolean }) {
  const [, setAttempt] = useState(0);
  const IconUsageDetails = iconUsage.component;
  return (
    <LoadBoundary
      what="icon usage"
      modules={iconUsage.modules}
      onRetry={() => {
        iconUsage.retry();
        setAttempt((count) => count + 1);
      }}
    >
      <Suspense fallback={<Text role="status">Loading icon usage…</Text>}>
        <IconUsageDetails name={name} filled={filled} />
      </Suspense>
    </LoadBoundary>
  );
}

function Usage({ reference, search }: { reference: Reference; search?: string }) {
  const query = new URLSearchParams(search);
  return (
    <>
      {reference.id === 'icons' && (
        <IconUsage name={query.get('icon')} filled={query.get('filled') === 'true'} />
      )}
      <Documentation document={reference} />
    </>
  );
}

function RelatedTopics({ page }: { page: ReferencePage }) {
  const related = (page.reference.related ?? []).flatMap((id) => {
    const destination = referencePages.find((item) => item.reference.id === id);
    return destination ? [destination] : [];
  });
  if (!related.length) return null;
  return (
    <Column gap={4} render={<section />}>
      <Text render={<h2 />} variant="headline">
        Related topics
      </Text>
      <Column gap={2}>
        {related.map((item) => (
          <Text key={item.path}>
            <Link href={pageHref(item)}>{item.reference.title}</Link>
          </Text>
        ))}
      </Column>
    </Column>
  );
}

/** The same reference structure serves foundations and components. */
export function ReferenceContent({
  page,
  view,
  search,
}: {
  page: ReferencePage;
  view: ReferenceView;
  search?: string;
}) {
  const { reference } = page;
  const BannerIcon = getReferenceIcon(reference.id, reference.group);
  const breadcrumb =
    page.section === 'Foundations' ? 'Foundations' : `Components / ${reference.group}`;
  const header = {
    path: page.path,
    title: reference.title,
    breadcrumb,
    description: reference.summary,
    // The icon is looked up among module-level components, not created here.
    // eslint-disable-next-line react-hooks/static-components
    symbol: <BannerIcon />,
    view,
    views: page.views,
  };
  if (reference.sections)
    return (
      <PageViews
        {...header}
        meta={<TemplateMeta page={page} />}
        content={Object.fromEntries(
          page.views.map(({ id }) => [id, <TemplateContent key={id} page={page} view={id} />]),
        )}
      />
    );
  return (
    <PageViews
      {...header}
      content={{
        preview: (
          <>
            {page.section === 'Foundations' ? (
              <FoundationPreview
                id={reference.id}
                onIconUsage={(name, filled) => {
                  navigate(
                    `${page.path}/usage?${new URLSearchParams({ icon: name, filled: String(filled) })}`,
                  );
                }}
              />
            ) : (
              <ComponentPreview id={reference.id} />
            )}
            <Column gap={7} className="docs-article">
              <RelatedTopics page={page} />
            </Column>
          </>
        ),
        usage: (
          <Column gap={7} className="docs-article">
            <Usage reference={reference} search={search} />
            <Text emphasis="muted">
              <Link href={routeHref('overview/get-started')}>
                Setup, local edits and version updates
              </Link>
            </Text>
          </Column>
        ),
      }}
    />
  );
}
