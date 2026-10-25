import { useEffect, useState, type ReactNode } from 'react';
import { Badge, Column, DescriptionList, Disclosure, Text } from '@envsemble/envui';
import { Documentation, GuidanceLists } from '../pages/Documentation';
import { documents, type Documentation as Document } from '../Reference';
import type { DocumentationMetadata, DocumentationSection } from '../DocumentationTypes';
import { FigureSection } from './Figures';
import { LiveExample } from './LiveExample';
import { Specimen } from './Specimen';
import { siteSection } from './Provides';
import { docsOnlySections } from '../../../../scripts/SiteContent.mjs';
import { pageOf, Related } from './Related';
import { WhenToUse } from './WhenToUse';
import { subscribeToAddress } from '../navigation/Address';

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
  plain = false,
  children,
}: {
  metadata: DocumentationMetadata;
  /** Leave out the statuses of exports that are code, such as a hook, as the Site does. */
  plain?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className="docs-page-meta">
      {metadata.status && (
        <Badge tone={statusTones[metadata.status]}>
          {metadata.status[0].toUpperCase() + metadata.status.slice(1)}
        </Badge>
      )}
      {/* On the Site, a component's status only: a hook or a function, such as useModifierKey, is
          code, which the Site never names; its page in the Docs shows its status. */}
      {Object.entries(metadata.statuses ?? {})
        .filter(([name]) => !plain || /^[A-Z]/.test(name))
        .map(([name, status]) => (
          <Badge key={name} tone={statusTones[status]}>
            {name}: {status[0].toUpperCase() + status.slice(1)}
          </Badge>
        ))}
      {metadata.since && (
        <Text render={<span />} variant="caption">
          Since {metadata.since}
        </Text>
      )}
      {children}
    </div>
  );
}

/**
 * An export as a Markdown link to the page of the Site that shows it; pages of docs/ are one folder
 * deep, so ../<path> reaches any of them from any page. An export documented only in the Docs, such
 * as Field, is its name alone: the Site links into the Docs only through the API button and the
 * Docs link, and shows no code outside its figures.
 */
function exportLink(name: string) {
  const page = pageOf(name);
  return page && !page.path.startsWith('docs/') ? `[${name}](../${page.reference.path})` : name;
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
  if (reference.format)
    return (
      <FigureSection
        reference={reference}
        section={section}
        leadAfter={reference.format === 'skill'}
        lead={
          // When to use opens with what the page is for, and in the one-file structure the rules.
          section.id === (reference.format === 'skill' ? 'rules' : 'usage') &&
          (reference.metadata?.useWhen.length || reference.metadata?.composes?.length) ? (
            <WhenToUse metadata={reference.metadata} path={reference.path} />
          ) : undefined
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
 * The three larger sections of a component or pattern page, each a group of its sections, by id:
 * what it is and its variants; when to use it and its parts, on the page's one band; how it adapts
 * and its accessibility. A section the list doesn't name joins the group of the section before it.
 */
const sectionGroups: readonly (readonly string[])[] = [
  ['overview', 'variants'],
  ['usage', 'anatomy'],
  ['width', 'accessibility'],
];

/**
 * The same for a page in the one-file structure: what it is; its rules and its parts, on the band;
 * its variants or options, how it behaves and the words to use.
 */
const skillGroups: readonly (readonly string[])[] = [
  ['overview'],
  ['rules', 'anatomy'],
  ['variants', 'behaviour', 'words'],
];

/** The group that sits on the band. */
const bandGroup = 1;

/** A page's sections in their groups, in the page's order; a group may be empty. */
function groupSections(sections: readonly DocumentationSection[], skill = false) {
  const order = skill ? skillGroups : sectionGroups;
  const groups: DocumentationSection[][] = order.map(() => []);
  let group = 0;
  for (const section of sections) {
    const named = order.findIndex((ids) => ids.includes(section.id));
    if (named >= 0) group = named;
    groups[group].push(section);
  }
  return groups;
}

/**
 * Sections in the template's order, then, with `related`, Related; the changelog is on the page in
 * the Docs. On the figure template, the sections come in their three groups, far apart, the second
 * on a band across the whole content pane; a group without sections, and a page's band where it
 * has neither When to use nor Anatomy, are left out.
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
  // The developer-only part, "## In code", and the changelog are on the page's guide in the Docs.
  const shown = sections
    .filter((section) => !docsOnlySections.has(section.id))
    .flatMap((section) => (provides ? section : (siteSection(section) ?? [])));
  const render = (section: DocumentationSection) => (
    <Section key={section.id} reference={reference} section={section} />
  );
  const end = related &&
    sections.some((section) => section.id === 'overview') &&
    reference.metadata && <Related metadata={reference.metadata} path={reference.path} />;
  if (!reference.format)
    return (
      <Column gap={8} className="docs-article docs-template">
        {shown.map(render)}
        {end}
      </Column>
    );
  return (
    <div
      className={
        reference.format === 'skill' ? 'docs-section-groups docs-skill' : 'docs-section-groups'
      }
    >
      {groupSections(shown, reference.format === 'skill').map((group, index) => {
        if (!group.length) return null;
        const content = (
          <div key={index} className="docs-article docs-template docs-figures docs-section-group">
            {group.map(render)}
          </div>
        );
        // A foundation's page sits on the page, without the band.
        return index === bandGroup && !reference.path.startsWith('foundations/') ? (
          <div key={index} className="docs-band">
            {content}
          </div>
        ) : (
          content
        );
      })}
      {end && (
        <div className="docs-article docs-template docs-figures docs-section-group">{end}</div>
      )}
    </div>
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
  // A component's or pattern's page is guidance: its lists are check lists.
  return (
    <GuidanceLists value>
      <Sections
        reference={document}
        sections={document.sections ?? []}
        provides={provides}
        related={related}
      />
    </GuidanceLists>
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

/** Whether the address names a page's changelog, as `#changelog` does. */
const namesChangelog = () => location.hash === '#changelog';

/**
 * A component's changelog, on its page in the Docs: quiet side information, rarely needed, so it
 * sits collapsed in a disclosure titled with its heading. An address that names it opens it, on
 * loading the page and on following a link to it; each version is a muted label beside what
 * changed in it, in small muted type.
 */
export function PageChangelog({ document }: { document: Document }) {
  const [open, setOpen] = useState(namesChangelog);
  useEffect(
    () =>
      subscribeToAddress(() => {
        if (namesChangelog()) setOpen(true);
      }),
    [],
  );
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
      <Disclosure
        open={open}
        onOpenChange={setOpen}
        title={
          <Text render={<h2 />} variant="body-sm" id="changelog" className="docs-changelog-title">
            {changelog.title}
          </Text>
        }
      >
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
      </Disclosure>
    </Column>
  );
}
