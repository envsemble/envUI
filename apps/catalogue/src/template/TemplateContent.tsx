import { Badge, Link, Stack, Text } from '@envsemble/envui';
import { Documentation } from '../pages/Documentation';
import { documents, type Documentation as Document } from '../Reference';
import {
  pageHref,
  referencePages,
  routeOfDocument,
  sectionViews,
  type ReferencePage,
  type ReferenceView,
} from '../navigation/DocumentationRoutes';
import { routeHref } from '../navigation/Address';
import type { DocumentationMetadata, DocumentationSection } from '../DocumentationTypes';
import { LiveExample } from './LiveExample';
import { PropsTables } from './PropsTables';
import { Specimen } from './Specimen';
import { TemplatePreview } from './TemplatePreview';

const statusTones = {
  experimental: 'warning',
  beta: 'neutral',
  stable: 'success',
  deprecated: 'danger',
} as const;

/**
 * The page that documents a component, for the alternatives a page suggests and the exports a
 * pattern combines: a part such as Menu.Item is documented on the page of its namespace.
 */
function pageOf(component: string) {
  const namespace = component.split('.')[0];
  return referencePages.find((page) => page.reference.metadata?.components.includes(namespace));
}

/** Status and first release under the title of a page on the template. */
export function MetadataBadges({ metadata }: { metadata: DocumentationMetadata }) {
  return (
    <div className="docs-page-meta">
      <Badge tone={statusTones[metadata.status]}>
        {metadata.status[0].toUpperCase() + metadata.status.slice(1)}
      </Badge>
      {Object.entries(metadata.statuses ?? {}).map(([name, status]) => (
        <Badge key={name} tone={statusTones[status]}>
          {name}: {status[0].toUpperCase() + status.slice(1)}
        </Badge>
      ))}
      <Text render={<span />} variant="caption">
        Since {metadata.since}
      </Text>
    </div>
  );
}

/** Status and first release under the title of a component or foundation page. */
export function TemplateMeta({ page }: { page: ReferencePage }) {
  return <MetadataBadges metadata={page.reference.metadata!} />;
}

/**
 * When to use the page's subject and, when not, what to use or read instead; for a pattern or
 * template, also what it is built from.
 */
function UseAndAvoid({ metadata, path }: { metadata: DocumentationMetadata; path: string }) {
  // Pages of docs/ are one folder deep, so ../<path> reaches any of them from any page.
  const exportLink = (name: string) => {
    const page = pageOf(name);
    return page ? `[${name}](../${page.path}.md)` : `\`${name}\``;
  };
  const markdown = [
    '### When to use',
    '',
    ...metadata.useWhen.map((text) => `- ${text}`),
    '',
    '### When not to use',
    '',
    ...metadata.avoidWhen.map(({ text, use, see }) => {
      const target = see && documents.find((document) => document.id === see);
      const instead = use
        ? ` Use ${exportLink(use)} instead.`
        : target
          ? ` See [${target.title}](../${target.path}).`
          : '';
      return `- ${text}${instead}`;
    }),
    ...(metadata.composes?.length
      ? ['', '### Built from', '', metadata.composes.map(exportLink).join(', ')]
      : []),
  ].join('\n');
  return <Documentation markdown={markdown} path={path} />;
}

function Section({ reference, section }: { reference: Document; section: DocumentationSection }) {
  return (
    <Stack render={<section />} gap={5} className="docs-template-section" data-section={section.id}>
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
        ) : block.kind === 'template' ? (
          <TemplatePreview
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

/** The address of a related page: a reference page's overview, or any other page's route. */
function relatedHref(id: string) {
  const page = referencePages.find((item) => item.reference.id === id);
  if (page) return pageHref(page, 'overview');
  const route = routeOfDocument(id);
  return route && routeHref(route);
}

function Related({ reference }: { reference: Document }) {
  const related = reference.related.flatMap((id) => {
    const document = documents.find((item) => item.id === id);
    const href = relatedHref(id);
    return document && href ? [{ document, href }] : [];
  });
  if (!related.length) return null;
  return (
    <Stack render={<section />} gap={4}>
      <Text render={<h2 />} variant="headline">
        Related
      </Text>
      <ul className="docs-related-list">
        {related.map(({ document, href }) => (
          <li key={document.id}>
            <Link href={href}>{document.title}</Link>
            <Text render={<span />} emphasis="muted">
              {' '}
              — {document.summary}
            </Text>
          </li>
        ))}
      </ul>
    </Stack>
  );
}

/** Sections in the template's order, with Related before the changelog. */
function Sections({
  reference,
  sections,
}: {
  reference: Document;
  sections: DocumentationSection[];
}) {
  const changelog = sections.find((section) => section.id === 'changelog');
  return (
    <Stack gap={8} className="docs-article docs-template">
      {sections
        .filter((section) => section !== changelog)
        .map((section) => (
          <Section key={section.id} reference={reference} section={section} />
        ))}
      {sections.some((section) => section.id === 'overview') && <Related reference={reference} />}
      {changelog && <Section reference={reference} section={changelog} />}
    </Stack>
  );
}

/** One view of a page on the template: the sections it shows, in the template's order. */
export function TemplateContent({ page, view }: { page: ReferencePage; view: ReferenceView }) {
  if (view === 'props')
    return (
      <Stack gap={7} className="docs-article docs-template">
        <PropsTables reference={page.reference} />
      </Stack>
    );
  return (
    <Sections
      reference={page.reference}
      sections={(page.reference.sections ?? []).filter(
        (section) => sectionViews[section.id] === view,
      )}
    />
  );
}

/** A pattern or template page, which has one view: every section in the template's order. */
export function SingleViewContent({ document }: { document: Document }) {
  return <Sections reference={document} sections={document.sections ?? []} />;
}
