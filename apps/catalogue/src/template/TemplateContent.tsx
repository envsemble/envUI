import { Badge, Link, Stack, Text } from '@envsemble/envui';
import { Documentation } from '../pages/Documentation';
import {
  pageHref,
  referencePages,
  sectionViews,
  type ReferencePage,
  type ReferenceView,
} from '../navigation/DocumentationRoutes';
import type { DocumentationMetadata, DocumentationSection } from '../DocumentationTypes';
import { LiveExample } from './LiveExample';
import { PropsTables } from './PropsTables';
import { Specimen } from './Specimen';

const statusTones = {
  experimental: 'warning',
  beta: 'neutral',
  stable: 'success',
  deprecated: 'danger',
} as const;

/** The page that documents a component, for the alternatives a page suggests. */
function pageOf(component: string) {
  return referencePages.find((page) => page.reference.metadata?.components.includes(component));
}

/** Status, first release and source under the title of a page on the template. */
export function TemplateMeta({ page }: { page: ReferencePage }) {
  const metadata = page.reference.metadata!;
  const source = Object.values(page.reference.props ?? {})[0]?.source;
  return (
    <div className="docs-page-meta">
      <Badge tone={statusTones[metadata.status]}>
        {metadata.status[0].toUpperCase() + metadata.status.slice(1)}
      </Badge>
      <Text as="span" variant="caption">
        Since {metadata.since}
      </Text>
      {source && (
        <Link href={`https://github.com/envsemble/envUI/blob/main/${source}`}>Source</Link>
      )}
    </div>
  );
}

/** When to use the component and, when not, what to use instead. */
function UseAndAvoid({ metadata, path }: { metadata: DocumentationMetadata; path: string }) {
  const markdown = [
    '### When to use',
    '',
    ...metadata.useWhen.map((text) => `- ${text}`),
    '',
    '### When not to use',
    '',
    ...metadata.avoidWhen.map(({ text, use }) => {
      const page = use && pageOf(use);
      const name = use && (page ? `[${use}](../${page.path}.md)` : `\`${use}\``);
      return `- ${text}${name ? ` Use ${name} instead.` : ''}`;
    }),
  ].join('\n');
  return <Documentation markdown={markdown} path={path} />;
}

function Section({ page, section }: { page: ReferencePage; section: DocumentationSection }) {
  const { reference } = page;
  return (
    <Stack as="section" gap={5} className="docs-template-section" data-section={section.id}>
      {section.blocks.map((block, index) =>
        block.kind === 'markdown' ? (
          <Documentation key={index} markdown={block.markdown} path={reference.path} />
        ) : block.kind === 'example' ? (
          <LiveExample
            key={block.name}
            page={reference.id}
            name={block.name}
            title={block.heading}
          />
        ) : (
          <Specimen key={block.name} page={reference.id} name={block.name} />
        ),
      )}
      {section.id === 'overview' && reference.metadata && (
        <UseAndAvoid metadata={reference.metadata} path={reference.path} />
      )}
    </Stack>
  );
}

function Related({ page }: { page: ReferencePage }) {
  const related = page.reference.related.flatMap((id) => {
    const destination = referencePages.find((item) => item.reference.id === id);
    return destination ? [destination] : [];
  });
  if (!related.length) return null;
  return (
    <Stack as="section" gap={4}>
      <Text as="h2" variant="page-heading">
        Related
      </Text>
      <ul className="docs-related-list">
        {related.map((item) => (
          <li key={item.path}>
            <Link href={pageHref(item, 'overview')}>{item.reference.title}</Link>
            <Text as="span" tone="muted">
              {' '}
              — {item.reference.summary}
            </Text>
          </li>
        ))}
      </ul>
    </Stack>
  );
}

/** One view of a page on the template: the sections it shows, in the template's order. */
export function TemplateContent({ page, view }: { page: ReferencePage; view: ReferenceView }) {
  const sections = (page.reference.sections ?? []).filter(
    (section) => sectionViews[section.id] === view,
  );
  if (view === 'props')
    return (
      <Stack gap={7} className="docs-article docs-template">
        <PropsTables reference={page.reference} />
      </Stack>
    );
  const changelog = sections.find((section) => section.id === 'changelog');
  return (
    <Stack gap={8} className="docs-article docs-template">
      {sections
        .filter((section) => section !== changelog)
        .map((section) => (
          <Section key={section.id} page={page} section={section} />
        ))}
      {view === 'overview' && <Related page={page} />}
      {changelog && <Section page={page} section={changelog} />}
    </Stack>
  );
}
