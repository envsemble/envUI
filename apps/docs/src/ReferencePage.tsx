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
import type { Reference } from './Reference';

function Guidelines({ reference }: { reference: Reference }) {
  return (
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
  );
}

function Usage({ reference }: { reference: Reference }) {
  const sections = reference.usage ?? [
    { title: 'React usage', example: reference.example, props: reference.props },
  ];
  return (
    <>
      {sections.map((section) => (
        <Stack as="section" key={section.title}>
          <Text as="h2" variant="page-heading">
            {section.title}
          </Text>
          <Code>{section.example}</Code>
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
            <a href={`#/${item.path}${item.reference.presentation ? '' : '/guidelines'}`}>
              {item.reference.title}
            </a>
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
  actions,
}: {
  page: ReferencePage;
  view: ReferenceView;
  actions?: ReactNode;
}) {
  const { reference } = page;
  const breadcrumb =
    page.section === 'Foundations' ? 'Foundations' : `Components / ${reference.group}`;
  if (reference.presentation) {
    return (
      <>
        <PageHeader title={reference.title} breadcrumb={breadcrumb} actions={actions} />
        {reference.presentation === 'compact' && <ComponentPreview id={reference.id} />}
        <div className="docs-article">
          {reference.presentation === 'guide' ? (
            reference.sections?.map((section) => (
              <Stack as="section" key={section.title}>
                <Text as="h2" variant="page-heading">
                  {section.title}
                </Text>
                {section.paragraphs.map((text) => (
                  <Text key={text} tone="muted">
                    {text}
                  </Text>
                ))}
                {section.example && <Code>{section.example}</Code>}
              </Stack>
            ))
          ) : (
            <>
              <Guidelines reference={reference} />
              <Usage reference={reference} />
            </>
          )}
          <RelatedTopics page={page} />
        </div>
      </>
    );
  }
  return (
    <Tabs
      key={page.path}
      aria-label={`${reference.title} reference views`}
      className="docs-reference-tabs"
      renderList={(list) => (
        <PageHeader title={reference.title} breadcrumb={breadcrumb} actions={actions}>
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
              <ComponentPreview id={reference.id} />
            )
          ) : item.id === 'guidelines' ? (
            <div className="docs-article">
              <Guidelines reference={reference} />
              <RelatedTopics page={page} />
            </div>
          ) : (
            <div className="docs-article">
              <Usage reference={reference} />
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
