import { Link, Stack, Text } from '@envsemble/envui';
import { CodeBlock } from '@envsemble/envui/content';
import {
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

const IconUsageDetails = lazy(() =>
  import('../usage/IconUsage').then(({ IconUsageDetails }) => ({ default: IconUsageDetails })),
);

function Usage({ reference, search }: { reference: Reference; search?: string }) {
  const query = new URLSearchParams(search);
  const sections = reference.usage ??
    reference.sections?.flatMap((section) =>
      section.example
        ? [{ title: section.title, example: section.example, props: reference.props }]
        : [],
    ) ?? [{ title: 'React usage', example: reference.example, props: reference.props }];
  return (
    <>
      {reference.id === 'icons' && (
        <Suspense fallback={<Text role="status">Loading icon usage…</Text>}>
          <IconUsageDetails name={query.get('icon')} filled={query.get('filled') === 'true'} />
        </Suspense>
      )}
      {sections.map((section) => (
        <Stack as="section" key={section.title}>
          <Text as="h2" variant="page-heading">
            {section.title}
          </Text>
          <CodeBlock language="tsx" copyable>
            {section.example}
          </CodeBlock>
          {section.props.length > 0 && (
            <>
              <Text as="h3" variant="section-heading">
                Props & contracts
              </Text>
              <table className="docs-props">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Contract</th>
                  </tr>
                </thead>
                <tbody>
                  {section.props.map(([name, contract]) => (
                    <tr key={name}>
                      <th>{name}</th>
                      <td>{contract}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </Stack>
      ))}
      <Text variant="caption">TypeScript declarations provide the complete public API.</Text>
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
            <Link href={`#/${item.path}/preview`}>{item.reference.title}</Link>
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
  return (
    <PageViews
      path={page.path}
      title={reference.title}
      breadcrumb={breadcrumb}
      description={reference.summary}
      symbol={<BannerIcon />}
      view={view}
      preview={
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
      }
      usage={
        <Stack gap={7} className="docs-article">
          <Usage reference={reference} search={search} />
          <RelatedTopics page={page} />
          <Text tone="muted">
            <Link href="#/overview/get-started">Setup, local edits and version updates</Link>
          </Text>
        </Stack>
      }
    />
  );
}
