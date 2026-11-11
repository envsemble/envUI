import { useEffect, useMemo, useState } from 'react';
import {
  Column,
  DescriptionList,
  Disclosure,
  Text,
  type TableOfContentsItem,
} from '@envsemble/envui';
import { PageMarkdown, GuidanceLists, markdownHeadings } from '../markdown/PageMarkdown';
import type { DocumentationEntry } from '@docs-model/DocumentationTypes';
import type { DocumentationSection } from '@docs-model/DocumentationTypes';
import { FigureSection, sectionTitle } from '../figures/Figures';
import { catalogueSection, docsOnlySections } from '@docs-model/CatalogueContent';
import { Related, relatedId, relatedTitle } from './Related';
import { alternativesOf } from './RelatedPages';
import { WhenToUse } from './WhenToUse';
import { useRevealed } from './useRevealed';
import { pendingAttribute, SectionOutline, useSectionOutline } from '../markdown/SectionOutline';
import { subscribeToAddress } from '../routes/Address';
import { useHydrated } from '@envui-internal/internal/react/useHydrated';

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
  page: DocumentationEntry;
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
 * The sections a page shows, in its order: those the catalogue shows, as it shows them, or, with
 * `provides`, whole; Compose and the changelog are on the page in the Docs.
 */
const shownSections = (sections: readonly DocumentationSection[], provides: boolean) =>
  sections
    .filter((section) => !docsOnlySections.has(section.id))
    .flatMap((section) => (provides ? section : (catalogueSection(section) ?? [])));

/** Whether a page, with `related`, ends with Related: a page with an Overview does. */
const hasRelated = (sections: readonly DocumentationSection[], related: boolean) =>
  related && sections.some((section) => section.id === 'overview');

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
  page: DocumentationEntry;
  sections: DocumentationSection[];
  provides: boolean;
  related: boolean;
  overviewHeading: boolean;
}) {
  const shown = useMemo(() => shownSections(sections, provides), [sections, provides]);
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
  const withRelated = hasRelated(sections, related);
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
              <SectionOutline key={section.id} value={before[index] + at >= revealed}>
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
 * rather than in a card, heads its figure (SiteBanner.tsx).
 */
export function TemplateContent({
  document,
  provides = false,
  related = true,
  overviewHeading = true,
}: {
  document: DocumentationEntry;
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
 * The sections TemplateContent shows of a page, given the same options, as the page's contents
 * list them: each section's heading, from its "## Title" line (FigureSection), then Related where
 * the page has alternatives.
 */
export function templateContents(
  document: DocumentationEntry,
  { provides = false, related = true }: { provides?: boolean; related?: boolean } = {},
): TableOfContentsItem[] {
  const sections = document.sections ?? [];
  const entries: TableOfContentsItem[] = shownSections(sections, provides).flatMap((section) =>
    markdownHeadings(sectionTitle(section))
      .filter(({ level }) => level === 2)
      .map(({ id, text }) => ({ id, label: text })),
  );
  if (
    hasRelated(sections, related) &&
    document.metadata &&
    alternativesOf(document.metadata).length
  )
    entries.push({ id: relatedId, label: relatedTitle });
  return entries;
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
    const last = entries.at(-1);
    // A version listed twice in a row is one entry, each change a paragraph of its own.
    if (entry && last?.version === entry[1]) last.text += `\n\n${entry[2]}`;
    else if (entry) entries.push({ version: entry[1], text: entry[2] });
    else if (/^\s/.test(line) && last) last.text += `\n${line.trim()}`;
    else return undefined;
  }
  return entries.length ? entries : undefined;
}

/** The id of a page's changelog heading in the Docs. */
export const changelogId = 'changelog';

/** Whether the address names a page's changelog, as `#changelog` does. */
const namesChangelog = () => location.hash === `#${changelogId}`;

/**
 * A component's changelog, on its page in the Docs: quiet side information, rarely needed, so it
 * sits collapsed in a disclosure titled with its heading. An address that names it opens it, on
 * loading the page and on following a link to it; each version is a muted label beside what
 * changed in it, in small muted type.
 */
export function PageChangelog({ document }: { document: DocumentationEntry }) {
  // Waiting its turn to show, it is its heading alone (SectionOutline).
  const outline = useSectionOutline();
  // A pre-rendered page renders it closed, as the server did, and opens it once it has hydrated.
  // The library's useHydrated, not the site's useFiguresMounted: a page opened at the changelog
  // shows it open in the render right after hydrating, rather than after the figures mount.
  const hydrated = useHydrated();
  const [open, setOpen] = useState(() => hydrated && namesChangelog());
  useEffect(() => {
    if (namesChangelog()) setOpen(true);
    return subscribeToAddress(() => {
      if (namesChangelog()) setOpen(true);
    });
  }, []);
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
      aria-labelledby={changelogId}
      {...pendingAttribute(outline)}
    >
      <Disclosure
        open={open}
        onOpenChange={setOpen}
        title={
          <Text render={<h2 />} variant="body-sm" id={changelogId} className="docs-changelog-title">
            {changelog.title}
          </Text>
        }
      >
        {outline ? null : entries ? (
          <DescriptionList.Root className="docs-changelog-entries">
            {entries.map(({ version, text }, index) => (
              <DescriptionList.Item key={`${index}-${version}`} label={version}>
                <PageMarkdown markdown={text} path={document.path} />
              </DescriptionList.Item>
            ))}
          </DescriptionList.Root>
        ) : (
          // A changelog written another way shows as its Markdown, below the same heading.
          <PageMarkdown markdown={markdown.replace(/^#{2,} .*$/m, '')} path={document.path} />
        )}
      </Disclosure>
    </Column>
  );
}
