import { Badge, Link, Message, Stack, Text } from '@envsemble/envui';
import { Documentation } from '../pages/Documentation';
import { documents, type Documentation as Document } from '../Reference';
import {
  pageHref,
  referencePages,
  routeOfDocument,
  viewOfSection,
  type ReferencePage,
  type ReferenceView,
} from '../navigation/DocumentationRoutes';
import { routeHref } from '../navigation/Address';
import type { DocumentationMetadata, DocumentationSection } from '../DocumentationTypes';
import { ExchangeColumns, ExchangeSection } from './Exchanges';
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
function UseAndAvoid({
  metadata,
  path,
  headings = ['When to use', 'When not to use'],
}: {
  metadata: DocumentationMetadata;
  path: string;
  headings?: [string, string];
}) {
  // Pages of docs/ are one folder deep, so ../<path> reaches any of them from any page.
  const exportLink = (name: string) => {
    const page = pageOf(name);
    return page ? `[${name}](../${page.path}.md)` : `\`${name}\``;
  };
  const markdown = [
    `### ${headings[0]}`,
    '',
    ...metadata.useWhen.map((text) => `- ${text}`),
    '',
    `### ${headings[1]}`,
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
  return headings[0] === 'When to use' ? (
    <Documentation markdown={markdown} path={path} />
  ) : (
    <ExchangeColumns markdown={markdown} path={path} />
  );
}

function Section({ reference, section }: { reference: Document; section: DocumentationSection }) {
  if (reference.format === 'exchanges')
    return (
      <ExchangeSection
        reference={reference}
        section={section}
        lead={
          section.id === 'usage' &&
          reference.metadata && (
            <UseAndAvoid
              metadata={reference.metadata}
              path={reference.path}
              headings={['Use it when', 'Use something else when']}
            />
          )
        }
      />
    );
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
        ) : block.kind === 'specimen' ? (
          <Specimen key={block.name} page={reference.id} name={block.name} />
        ) : null,
      )}
      {section.id === 'overview' && reference.metadata && !reference.format && (
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

/**
 * The last exchange of a page of exchanges, which leads to its props: the Props view lists them,
 * generated from the TypeScript declarations.
 */
function PropsExchange({ reference }: { reference: Document }) {
  const page = referencePages.find((item) => item.reference.id === reference.id);
  const components = reference.metadata?.components ?? [];
  if (!page || !components.length) return null;
  const names = components.map((name) => `\`${name}\``);
  const list = names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names.at(-1)}` : names[0];
  return (
    <section className="docs-exchange" data-section="props">
      <div className="docs-exchange-header">
        <div className="docs-exchange-heading">
          <Documentation markdown="## Props" path={reference.path} />
        </div>
        <Message from="self" className="docs-exchange-question" aria-label="Question on props">
          Which props does {reference.title} take?
        </Message>
      </div>
      <div className="docs-exchange-answer">
        <Documentation
          markdown={`The props reference lists every prop of ${list}, with its type, its default and what it does, generated from the TypeScript declarations.`}
          path={reference.path}
        />
        <Text>
          <Link href={pageHref(page, 'props')}>Open the props reference</Link>
        </Text>
      </div>
    </section>
  );
}

/** Sections in the template's order, then Related; the changelog follows the page navigation. */
function Sections({
  reference,
  sections,
}: {
  reference: Document;
  sections: DocumentationSection[];
}) {
  const exchanges = reference.format === 'exchanges';
  return (
    <Stack gap={8} className={`docs-article docs-template${exchanges ? ' docs-exchanges' : ''}`}>
      {sections
        .filter((section) => section.id !== 'changelog')
        .map((section) => (
          <Section key={section.id} reference={reference} section={section} />
        ))}
      {exchanges && <PropsExchange reference={reference} />}
      {sections.some((section) => section.id === 'overview') && <Related reference={reference} />}
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
        (section) => viewOfSection(page.reference, section.id) === view,
      )}
    />
  );
}

/** A pattern or template page, which has one view: every section in the template's order. */
export function SingleViewContent({ document }: { document: Document }) {
  return <Sections reference={document} sections={document.sections ?? []} />;
}

/**
 * A page's changelog, below the page navigation in smaller, quieter type than the guidance: on a
 * page with views it shows with the view that holds it, on a page with one view always.
 */
export function PageChangelog({ document, view }: { document: Document; view?: ReferenceView }) {
  const changelog = document.sections?.find((section) => section.id === 'changelog');
  if (!changelog || (view && viewOfSection(document, changelog.id) !== view)) return null;
  return (
    <div className="docs-article docs-template docs-changelog">
      <Section reference={document} section={changelog} />
    </div>
  );
}
