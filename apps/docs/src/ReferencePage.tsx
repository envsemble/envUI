import { Button, Stack, Tabs, Text } from '@envsemble/envui';
import type { ReactNode } from 'react';
import { Code } from './Code';
import {
  referencePages,
  referenceViews,
  type ReferencePage,
  type ReferenceView,
} from './Documentation';
import { FoundationPreview } from './Foundations';
import { ComponentPreview } from './Previews';
import { PageHeader } from './PageHeader';

function RelatedTopics({ page }: { page: ReferencePage }) {
  const related = (page.reference.related ?? []).flatMap((id) => {
    const destination = referencePages.find((item) => item.reference.id === id);
    return destination ? [destination] : [];
  });
  if (!related.length) return null;
  return (
    <Stack as="section" gap={3}>
      <Text as="h2" variant="page-heading">
        Related topics
      </Text>
      <Stack gap={2}>
        {related.map((item) => (
          <Text key={item.path}>
            <a href={`#/${item.path}/guidelines`}>{item.reference.title}</a>
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
  resetVersion,
  actions,
}: {
  page: ReferencePage;
  view: ReferenceView;
  resetVersion: number;
  actions: ReactNode;
}) {
  const { reference } = page;
  return (
    <Tabs
      key={page.path}
      aria-label={`${reference.title} reference views`}
      className="docs-reference-tabs"
      renderList={(list) => (
        <PageHeader
          title={reference.title}
          breadcrumb={
            page.section === 'Foundations' ? 'Foundations' : `Components / ${reference.group}`
          }
          summary={reference.summary}
          actions={actions}
        >
          {list}
        </PageHeader>
      )}
      value={view}
      onValueChange={(value) => {
        if (value) location.hash = `/${page.path}/${value}`;
      }}
      items={referenceViews.map((item) => ({
        value: item.id,
        button: <Button>{item.title}</Button>,
        content:
          item.id === 'preview' ? (
            page.section === 'Foundations' ? (
              <FoundationPreview id={reference.id} />
            ) : (
              <ComponentPreview key={resetVersion} id={reference.id} />
            )
          ) : item.id === 'guidelines' ? (
            <div className="docs-article">
              <Stack as="section">
                <Text as="h2" variant="page-heading">
                  Design & behavior
                </Text>
                {reference.guidelines.map((text) => (
                  <Text key={text} tone="muted">
                    {text}
                  </Text>
                ))}
              </Stack>
              <RelatedTopics page={page} />
            </div>
          ) : (
            <div className="docs-article">
              <Stack as="section">
                <Text as="h2" variant="page-heading">
                  React usage
                </Text>
                <Code>{reference.example}</Code>
              </Stack>
              <Stack as="section">
                <Text as="h2" variant="page-heading">
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
                    {reference.props.map(([name, contract]) => (
                      <tr key={name}>
                        <th>{name}</th>
                        <td>{contract}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <Text variant="caption">
                  TypeScript declarations provide the complete public API.
                </Text>
              </Stack>
              <RelatedTopics page={page} />
              <Text tone="muted">
                <a href="#/getting-started">Setup, local edits and version updates</a>
              </Text>
            </div>
          ),
      }))}
    />
  );
}
