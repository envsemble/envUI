import { Badge, Column, DescriptionList, Link, Text } from '@envsemble/envui';
import { Documentation } from '../pages/Documentation';
import { documents, type Documentation as Document } from '../Reference';
import {
  pageHref,
  referencePages,
  viewOfSection,
  type ReferencePage,
  type ReferenceView,
} from '../navigation/DocumentationRoutes';
import type { DocumentationMetadata, DocumentationSection } from '../DocumentationTypes';
import { FigureSection } from './Figures';
import { LiveExample } from './LiveExample';
import { PropsTables } from './PropsTables';
import { Specimen } from './Specimen';
import { pageOf, relatedHref, WhenToUse } from './WhenToUse';

const statusTones = {
  experimental: 'warning',
  beta: 'neutral',
  stable: 'success',
  deprecated: 'danger',
} as const;

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

/** An export as a Markdown link to the page that documents it; pages of docs/ are one folder
 * deep, so ../<path> reaches any of them from any page. */
function exportLink(name: string) {
  const page = pageOf(name);
  return page ? `[${name}](../${page.path}.md)` : `\`${name}\``;
}

/**
 * When to use the page's subject and, when not, what to use or read instead; for a pattern or
 * template, also what it is built from.
 */
function UseAndAvoid({ metadata, path }: { metadata: DocumentationMetadata; path: string }) {
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
  if (reference.format === 'figures')
    return (
      <FigureSection
        reference={reference}
        section={section}
        lead={
          section.id === 'usage' &&
          reference.metadata && (
            <WhenToUse
              metadata={reference.metadata}
              path={reference.path}
              exportLink={exportLink}
            />
          )
        }
      />
    );
  return (
    <Column
      render={<section />}
      gap={5}
      className="docs-template-section"
      data-section={section.id}
    >
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
        ) : block.kind === 'specimen' ? (
          <Specimen key={block.name} page={reference.id} name={block.name} />
        ) : null,
      )}
      {section.id === 'overview' && reference.metadata && !reference.format && (
        <UseAndAvoid metadata={reference.metadata} path={reference.path} />
      )}
    </Column>
  );
}

function Related({ reference }: { reference: Document }) {
  const related = reference.related.flatMap((id) => {
    const document = documents.find((item) => item.id === id);
    const href = relatedHref(id);
    return document && href ? [{ document, href }] : [];
  });
  if (!related.length) return null;
  return (
    <Column render={<section />} gap={4}>
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
    </Column>
  );
}

/**
 * The Props section of a page on the figure template, which leads to the Props view: it lists them,
 * generated from the TypeScript declarations.
 */
function PropsSection({ reference }: { reference: Document }) {
  const page = referencePages.find((item) => item.reference.id === reference.id);
  const components = reference.metadata?.components ?? [];
  if (!page || !components.length) return null;
  const names = components.map((name) => `\`${name}\``);
  const list = names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names.at(-1)}` : names[0];
  return (
    <section className="docs-figure-section" data-section="props">
      <div className="docs-figure-section-heading">
        <Documentation markdown="## Props" path={reference.path} />
      </div>
      <Documentation
        markdown={`Every prop of ${list}, with its type and default.`}
        path={reference.path}
      />
      <Text>
        <Link href={pageHref(page, 'props')}>Open the props reference</Link>
      </Text>
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
  const figures = reference.format === 'figures';
  return (
    <Column
      gap={figures ? 9 : 8}
      className={`docs-article docs-template${figures ? ' docs-figures' : ''}`}
    >
      {sections
        .filter((section) => section.id !== 'changelog')
        .map((section) => (
          <Section key={section.id} reference={reference} section={section} />
        ))}
      {figures && <PropsSection reference={reference} />}
      {sections.some((section) => section.id === 'overview') && <Related reference={reference} />}
    </Column>
  );
}

/** One view of a page on the template: the sections it shows, in the template's order. */
export function TemplateContent({ page, view }: { page: ReferencePage; view: ReferenceView }) {
  if (view === 'props')
    return (
      <Column gap={7} className="docs-article docs-template">
        <PropsTables reference={page.reference} />
      </Column>
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

/** A pattern page, which has one view: every section in the page's order. */
export function SingleViewContent({ document }: { document: Document }) {
  return <Sections reference={document} sections={document.sections ?? []} />;
}

/**
 * A changelog's entries, "- **1.0.0**: what changed", one per version, or nothing where it is
 * written otherwise.
 */
function changelogEntries(markdown: string) {
  const entries: { version: string; text: string }[] = [];
  for (const line of markdown.split('\n')) {
    if (!line.trim() || /^#{2,} /.test(line)) continue;
    const entry = /^- \*\*([^*]+)\*\*:\s*(.*)$/.exec(line);
    // A version listed twice in a row is one entry, each change a paragraph of its own.
    if (entry && entries.at(-1)?.version === entry[1]) entries.at(-1)!.text += `\n\n${entry[2]}`;
    else if (entry) entries.push({ version: entry[1], text: entry[2] });
    else if (/^\s/.test(line) && entries.length) entries.at(-1)!.text += `\n${line.trim()}`;
    else return undefined;
  }
  return entries.length ? entries : undefined;
}

/**
 * A page's changelog, below the page navigation: quiet side information, each version a muted
 * label beside what changed in it, in small muted type. On a page with views it shows with the
 * view that holds it, on a page with one view always.
 */
export function PageChangelog({ document, view }: { document: Document; view?: ReferenceView }) {
  const changelog = document.sections?.find((section) => section.id === 'changelog');
  if (!changelog || (view && viewOfSection(document, changelog.id) !== view)) return null;
  const markdown = changelog.blocks
    .map((block) => (block.kind === 'markdown' ? block.markdown : ''))
    .join('\n');
  const entries = changelogEntries(markdown);
  return (
    <Column
      render={<section />}
      gap={3}
      className="docs-changelog"
      data-section={changelog.id}
      aria-labelledby="changelog"
    >
      <Text render={<h2 />} variant="body-sm" id="changelog" className="docs-changelog-title">
        {changelog.title}
      </Text>
      {entries ? (
        <DescriptionList.Root className="docs-changelog-entries">
          {entries.map(({ version, text }, index) => (
            <DescriptionList.Item key={`${index}-${version}`} label={version}>
              <Documentation markdown={text} path={document.path} />
            </DescriptionList.Item>
          ))}
        </DescriptionList.Root>
      ) : (
        // A changelog written another way shows as its Markdown, below the same heading.
        <Documentation markdown={markdown.replace(/^#{2,} .*$/m, '')} path={document.path} />
      )}
    </Column>
  );
}
