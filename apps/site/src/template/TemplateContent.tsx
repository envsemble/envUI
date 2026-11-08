import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Badge, Column, DescriptionList, Disclosure, Text } from '@envsemble/envui';
import { Documentation, GuidanceLists } from '../pages/Documentation';
import type { Documentation as Document } from '../pages/PageModel';
import type {
  DocumentationMetadata,
  DocumentationSection,
} from '../../../../scripts/docs/model/DocumentationTypes';
import { FigureSection } from '../figures/Figures';
import { catalogueSection } from './Provides';
import { docsOnlySections } from '../../../../scripts/docs/model/CatalogueContent';
import { Related } from './Related';
import { WhenToUse } from './WhenToUse';
import { useRevealed } from './useRevealed';
import { pendingAttribute, SectionOutline, useSectionOutline } from './SectionOutline';
import { subscribeToAddress } from '../navigation/Address';
import { statusTones } from '../navigation/PageBadges';

/**
 * Status and first release under the title of a component's or pattern's page, and after them
 * `children`, such as the button to its counterpart in the catalogue or the Docs.
 */
export function MetadataBadges({
  metadata,
  plain = false,
  children,
}: {
  metadata: Pick<DocumentationMetadata, 'status' | 'statuses' | 'since'>;
  /** Leave out the statuses of exports that are code, such as a hook, as the catalogue does. */
  plain?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className="site-page-meta">
      {metadata.status && (
        <Badge tone={statusTones[metadata.status]}>
          {metadata.status[0].toUpperCase() + metadata.status.slice(1)}
        </Badge>
      )}
      {/* In the catalogue, a component's status only: a hook or a function, such as
          useModifierKey, is code, which the catalogue never names; its page in the Docs shows
          its status. */}
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
 * One section of a page; Rules opens with when to use it, after its own lead. Without
 * `overviewHeading`, Overview's heading is for the page's contents and assistive technology alone,
 * as the page's title, right above, heads its figure.
 */
function Section({
  page,
  section,
  overviewHeading,
}: {
  page: Document;
  section: DocumentationSection;
  overviewHeading: boolean;
}) {
  return (
    <FigureSection
      page={page}
      section={section}
      headingHidden={!overviewHeading && section.id === 'overview'}
      leadAfter
      lead={
        section.id === 'rules' &&
        (page.metadata?.useWhen.length || page.metadata?.composes?.length) ? (
          <WhenToUse metadata={page.metadata} path={page.path} />
        ) : undefined
      }
    />
  );
}

/**
 * The three larger sections of a page, each a group of its sections, by id: what it is, its
 * variants or options, its parts and how it behaves; its rules, which open with when to use it;
 * its accessibility and the words to use. A section the list doesn't name joins
 * the group of the section before it.
 */
const sectionGroups: readonly (readonly string[])[] = [
  ['overview', 'variants', 'anatomy', 'behaviour'],
  ['rules'],
  ['accessibility', 'words'],
];

/** A page's sections in their groups, in the page's order; a group may be empty. */
function groupSections(sections: readonly DocumentationSection[]) {
  const groups: DocumentationSection[][] = sectionGroups.map(() => []);
  let group = 0;
  for (const section of sections) {
    const named = sectionGroups.findIndex((ids) => ids.includes(section.id));
    if (named >= 0) group = named;
    groups[group].push(section);
  }
  return groups;
}

/**
 * Sections in the page's order, in their three groups, far apart, then, with `related`, Related;
 * Compose and the changelog are on the page in the Docs. A group without sections is left out. The
 * sections after the first render one after another as the page paints (useRevealed), Related last;
 * meanwhile each is its outline, its headings hidden in its place (SectionOutline), so the page's
 * contents are whole from the start, and the page is busy until they all have.
 */
function Sections({
  page,
  sections,
  provides,
  related,
  overviewHeading,
}: {
  page: Document;
  sections: DocumentationSection[];
  provides: boolean;
  related: boolean;
  overviewHeading: boolean;
}) {
  const shown = useMemo(
    () =>
      sections
        .filter((section) => !docsOnlySections.has(section.id))
        .flatMap((section) => (provides ? section : (catalogueSection(section) ?? []))),
    [sections, provides],
  );
  // Each section's element, made once, so revealing the next leaves those shown as they are.
  const elements = useMemo(
    () =>
      new Map(
        shown.map((section) => [
          section.id,
          <Section
            key={section.id}
            page={page}
            section={section}
            overviewHeading={overviewHeading}
          />,
        ]),
      ),
    [shown, page, overviewHeading],
  );
  const withRelated = related && sections.some((section) => section.id === 'overview');
  const total = shown.length + (withRelated ? 1 : 0);
  const revealed = useRevealed(total);
  const relatedElement = useMemo(
    () => page.metadata && <Related metadata={page.metadata} path={page.path} />,
    [page],
  );
  const groups = groupSections(shown);
  // The sections before each group, to count the group's revealed ones.
  const before = groups.map((_, index) =>
    groups.slice(0, index).reduce((count, group) => count + group.length, 0),
  );
  return (
    <div className="site-section-groups" aria-busy={revealed < total || undefined}>
      {groups.map((group, index) =>
        group.length ? (
          <div key={index} className="site-article site-template site-figures site-section-group">
            {group.map((section, at) => (
              <SectionOutline key={section.id} value={before[index]! + at >= revealed}>
                {elements.get(section.id)}
              </SectionOutline>
            ))}
          </div>
        ) : null,
      )}
      {withRelated && relatedElement && (
        <div className="site-article site-template site-figures site-section-group">
          <SectionOutline value={revealed <= shown.length}>{relatedElement}</SectionOutline>
        </div>
      )}
    </div>
  );
}

/**
 * A component, pattern or foundation page of the catalogue: its sections in order, then Related;
 * a component's props, part names, what the application provides and changelog are on its page in
 * the Docs. For Field, whose whole page is in the Docs, `provides` keeps what envUI and the
 * application provide in Accessibility and `related={false}` leaves out Related, which the Docs
 * don't have. `overviewHeading={false}` hides Overview's heading where the page's title, on the page
 * rather than in a card, heads its figure (PageHeader.tsx).
 */
export function TemplateContent({
  document,
  provides = false,
  related = true,
  overviewHeading = true,
}: {
  document: Document;
  provides?: boolean;
  related?: boolean;
  overviewHeading?: boolean;
}) {
  // A component's or pattern's page is guidance: its lists are check lists.
  return (
    <GuidanceLists value>
      <Sections
        page={document}
        sections={document.sections ?? []}
        provides={provides}
        related={related}
        overviewHeading={overviewHeading}
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
  // Waiting its turn to show, it is its heading alone (SectionOutline).
  const outline = useSectionOutline();
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
      {...pendingAttribute(outline)}
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
        {outline ? null : entries ? (
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
