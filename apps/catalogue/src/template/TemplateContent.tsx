import type { ReactNode } from 'react';
import { Badge, Column, DescriptionList, Text } from '@envsemble/envui';
import { Documentation } from '../pages/Documentation';
import { documents, type Documentation as Document } from '../Reference';
import type { DocumentationMetadata, DocumentationSection } from '../DocumentationTypes';
import { FigureSection } from './Figures';
import { LiveExample } from './LiveExample';
import { Specimen } from './Specimen';
import { siteSection } from './Provides';
import { pageOf, Related } from './Related';
import { WhenToUse } from './WhenToUse';

const statusTones = {
  experimental: 'warning',
  beta: 'neutral',
  stable: 'success',
  deprecated: 'danger',
} as const;

/**
 * Status and first release under the title of a page on the template, and after them `children`,
 * such as the link to a component's page in the Docs.
 */
export function MetadataBadges({
  metadata,
  children,
}: {
  metadata: DocumentationMetadata;
  children?: ReactNode;
}) {
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
      {children}
    </div>
  );
}

/**
 * An export as a Markdown link to the page of the Site that shows it; pages of docs/ are one folder
 * deep, so ../<path> reaches any of them from any page. An export documented only in the Docs, such
 * as Field, is code: the Site links into the Docs only through the API button and the Docs link.
 */
function exportLink(name: string) {
  const page = pageOf(name);
  return page && !page.path.startsWith('docs/')
    ? `[${name}](../${page.reference.path})`
    : `\`${name}\``;
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

/**
 * Sections in the template's order, then, with `related`, Related on a band of its own across the
 * content pane; the changelog is on the page in the Docs.
 */
function Sections({
  reference,
  sections,
  provides,
  related,
}: {
  reference: Document;
  sections: DocumentationSection[];
  provides: boolean;
  related: boolean;
}) {
  const figures = reference.format === 'figures';
  return (
    <>
      <Column
        gap={figures ? 9 : 8}
        className={`docs-article docs-template${figures ? ' docs-figures' : ''}`}
      >
        {sections
          .filter((section) => section.id !== 'changelog')
          .flatMap((section) => (provides ? section : (siteSection(section) ?? [])))
          .map((section) => (
            <Section key={section.id} reference={reference} section={section} />
          ))}
      </Column>
      {related && sections.some((section) => section.id === 'overview') && reference.metadata && (
        <Related metadata={reference.metadata} path={reference.path} />
      )}
    </>
  );
}

/**
 * A component or pattern page of the Site: every section in the page's order, then Related; a
 * component's props, part names, what the application provides and changelog are on its page in
 * the Docs. `provides` keeps what envUI and the application provide in Accessibility, for Field,
 * whose whole page is in the Docs, where `related={false}` leaves Related for the page's end.
 */
export function TemplateContent({
  document,
  provides = false,
  related = true,
}: {
  document: Document;
  provides?: boolean;
  related?: boolean;
}) {
  return (
    <Sections
      reference={document}
      sections={document.sections ?? []}
      provides={provides}
      related={related}
    />
  );
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
 * A component's changelog, on its page in the Docs: quiet side information, each version a muted
 * label beside what changed in it, in small muted type.
 */
export function PageChangelog({ document }: { document: Document }) {
  const changelog = document.sections?.find((section) => section.id === 'changelog');
  if (!changelog) return null;
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
