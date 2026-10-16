import { Link, Stack, Text } from '@envsemble/envui';
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
import { lazy, Suspense } from 'react';
import type { Reference } from '../Reference';
import { getReferenceIcon } from '../navigation/TopicIcons';
import { TemplateContent, TemplateMeta } from '../template/TemplateContent';

const IconUsageDetails = lazy(() =>
  import('../usage/IconUsage').then(({ IconUsageDetails }) => ({ default: IconUsageDetails })),
);

function Usage({ reference, search }: { reference: Reference; search?: string }) {
  const query = new URLSearchParams(search);
  return (
    <>
      {reference.id === 'icons' && (
        <Suspense fallback={<Text role="status">Loading icon usage…</Text>}>
          <IconUsageDetails name={query.get('icon')} filled={query.get('filled') === 'true'} />
        </Suspense>
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
    <Stack as="section">
      <Text as="h2" variant="page-heading">
        Related topics
      </Text>
      <Stack gap={2}>
        {related.map((item) => (
          <Text key={item.path}>
            <Link href={pageHref(item)}>{item.reference.title}</Link>
          </Text>
        ))}
      </Stack>
    </Stack>
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
                  location.hash = `/${page.path}/usage?${new URLSearchParams({ icon: name, filled: String(filled) })}`;
                }}
              />
            ) : (
              <ComponentPreview id={reference.id} />
            )}
            <Stack gap={7} className="docs-article">
              <RelatedTopics page={page} />
            </Stack>
          </>
        ),
        usage: (
          <Stack gap={7} className="docs-article">
            <Usage reference={reference} search={search} />
            <Text tone="muted">
              <Link href="#/overview/get-started">Setup, local edits and version updates</Link>
            </Text>
          </Stack>
        ),
      }}
    />
  );
}
