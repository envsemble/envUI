import { useEffect, useMemo, useState } from 'react';
import {
  Column,
  DescriptionList,
  Disclosure,
  Text,
  type TableOfContentsItem,
} from '@envsemble/envui';
import { PageMarkdown, GuidanceLists, markdownHeadings } from '../markdown/PageMarkdown';
import type { DocumentationEntry } from '../documentation/DocumentationTypes';
import type { DocumentationSection } from '../documentation/DocumentationTypes';
import { FigureSection, sectionTitle } from '../figures/Figures';
import { catalogueSection, docsOnlySections } from '../documentation/CatalogueContent';
import { Related, relatedId, relatedTitle } from './Related';
import { alternativesOf } from './RelatedPages';
import { WhenToUse } from './WhenToUse';
import { useRevealed } from './useRevealed';
import { pendingAttribute, SectionOutline, useSectionOutline } from '../markdown/SectionOutline';
import { subscribeToAddress } from '../routes/Address';
import { useHydrated } from '../shared/useHydrated';

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
        section.id === 'rules' && page.metadata?.useWhen.length ? (
          <WhenToUse metadata={page.metadata} path={page.path} />
        ) : undefined
      }
    />
  );
}

const sectionGroups: readonly (readonly string[])[] = [
  ['overview', 'variants', 'anatomy', 'behaviour'],
  ['rules'],
  ['accessibility', 'words'],
];

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

const shownSections = (sections: readonly DocumentationSection[], provides: boolean) =>
  sections
    .filter((section) => !docsOnlySections.has(section.id))
    .flatMap((section) => (provides ? section : (catalogueSection(section) ?? [])));

const hasRelated = (sections: readonly DocumentationSection[], related: boolean) =>
  related && sections.some((section) => section.id === 'overview');

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
  const shownBeforeGroup = groups.map((_, index) =>
    groups.slice(0, index).reduce((count, group) => count + group.length, 0),
  );
  return (
    <div className="site-section-groups" aria-busy={revealed < total || undefined}>
      {groups.map((group, index) =>
        group.length ? (
          <div key={index} className="site-article site-template site-figures site-section-group">
            {group.map((section, indexInGroup) => (
              <SectionOutline
                key={section.id}
                value={shownBeforeGroup[index] + indexInGroup >= revealed}
              >
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

function changelogEntries(markdown: string) {
  const entries: { version: string; text: string }[] = [];
  for (const line of markdown.split('\n')) {
    if (!line.trim() || /^#{2,} /.test(line)) continue;
    const entry = /^- \*\*([^*]+)\*\*:\s*(.*)$/.exec(line);
    const last = entries.at(-1);
    const repeatsLastVersion = entry && last?.version === entry[1];
    if (repeatsLastVersion) last.text += `\n\n${entry[2]}`;
    else if (entry) entries.push({ version: entry[1], text: entry[2] });
    else if (/^\s/.test(line) && last) last.text += `\n${line.trim()}`;
    else return undefined;
  }
  return entries.length ? entries : undefined;
}

export const changelogId = 'changelog';

const namesChangelog = () => location.hash === `#${changelogId}`;

export function PageChangelog({ document }: { document: DocumentationEntry }) {
  const outline = useSectionOutline();
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
          <PageMarkdown markdown={markdown.replace(/^#{2,} .*$/m, '')} path={document.path} />
        )}
      </Disclosure>
    </Column>
  );
}
