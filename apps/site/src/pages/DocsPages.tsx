import { useMemo } from 'react';
import { Column, Text, type TableOfContentsItem } from '@envsemble/envui';
import type { DocumentationEntry } from '../documentation/DocumentationTypes';
import { SiteBanner } from '../frame/SiteBanner';
import { pagesOf, type DocumentPage, type RoutePage } from '../routes/SiteRoutes';
import { docsTrail } from '../routes/Trails';
import { docsRoute } from '../routes/Address';
import { PartSwitch } from '../routes/OtherPart';
import {
  changelogId,
  PageChangelog,
  TemplateContent,
  templateContents,
} from '../template/TemplateContent';
import { MetadataBadges } from '../template/MetadataBadges';
import { useRevealed } from '../template/useRevealed';
import { SectionOutline } from '../markdown/SectionOutline';
import { useDocument } from './PageContent';
import { GuideDocument, guideContents } from './GuideDocument';
import { LoadedPart } from '../loading/LoadedPart';
import { pageParts } from './PageParts';
import { partsOfPage } from './ViewModules';
import { ChangelogSkeleton } from './ChangelogOutline';
import { tokenContents, TokenReferenceSkeleton } from './TokenTables';
import { ReleaseNotes } from './ReleaseNotes';
import { AgentSetup, agentSetupContents } from './AgentSetup';
import {
  CodeGuide,
  codeGuideContents,
  colorEntries,
  ColorProperties,
  docsHeadings,
  hasProvides,
  PaletteSection,
  partEntries,
  PartNames,
  PropsSection,
  Provides,
  Strings,
  WordsInCode,
} from './DocsSections';
import { wordsInCode, withoutAgentNote } from '../documentation/DocsContent';

/*
 * The Docs' route views: a guide, the token reference, the changelog, a foundation's developer
 * part and a component's or a pattern's reference, each placing its sections (DocsSections.tsx).
 */

/** On the Docs' home, the guide's note on coding agents moves up under the prompt. */
function guideParts(whole: DocumentationEntry, home: boolean) {
  const { markdown, note } = home ? withoutAgentNote(whole.markdown ?? '') : {};
  return { document: note ? { ...whole, markdown } : whole, note };
}

/**
 * A guide of docs/, such as migration, with its figures in place. The setup guide is the Docs'
 * home, with the prompt that sets envUI up with a coding agent at its top.
 */
export function GuidePage({ page }: { page: DocumentPage }) {
  const whole = useDocument(page.document);
  const home = page.path === docsRoute;
  const { document, note } = useMemo(() => guideParts(whole, home), [whole, home]);
  return (
    <>
      <SiteBanner
        title={page.title}
        trail={docsTrail(page)}
        description={page.summary}
        kind="docs"
        meta={<MetadataBadges metadata={{ status: page.document.status }} />}
        corner={<PartSwitch page={page} />}
      />
      <Column gap={7} className="site-article">
        {home && <AgentSetup note={note} path={whole.path} />}
        <GuideDocument document={document} />
      </Column>
    </>
  );
}

/** Every design token, with its value in each theme and scale. */
export function TokensPage({ page }: { page: RoutePage }) {
  return (
    <>
      <SiteBanner
        title={page.title}
        trail={docsTrail(page)}
        description={page.summary}
        kind="docs"
      />
      <Column gap={7} className="site-article">
        <LoadedPart
          part={pageParts.tokenReference}
          what="token reference"
          placeholder={<TokenReferenceSkeleton />}
        />
      </Column>
    </>
  );
}

/** The Changelog page's two sections. */
const highlights = { id: 'highlights', label: 'Highlights' };
const everyChange = { id: 'every-change', label: 'Every change' };

/**
 * What changed in each release of @envsemble/envui: the release notes, a few lines on each release
 * with what it breaks, then every change as the releases write them.
 */
export function ChangelogDocsPage({ page }: { page: RoutePage }) {
  return (
    <>
      <SiteBanner
        title={page.title}
        trail={docsTrail(page)}
        description={page.summary}
        kind="docs"
      />
      <Column gap={8} className="site-article">
        <Column gap={6} render={<section aria-labelledby={highlights.id} />}>
          <Text render={<h2 id={highlights.id} />} variant="title" className="site-section-title">
            {highlights.label}
          </Text>
          <ReleaseNotes />
        </Column>
        <Column gap={6} render={<section aria-labelledby={everyChange.id} />}>
          <Text render={<h2 id={everyChange.id} />} variant="title" className="site-section-title">
            {everyChange.label}
          </Text>
          <LoadedPart
            part={pageParts.changelog}
            what="changelog"
            placeholder={<ChangelogSkeleton />}
          />
        </Column>
      </Column>
    </>
  );
}

/**
 * A foundation's page in the Docs, the developer part its page in the catalogue leaves out, from
 * the same file: Compose, the words of the page mapped to code, and what the application and envUI
 * provide. No Related.
 */
export function FoundationGuidePage({ page }: { page: DocumentPage }) {
  const document = useDocument(page.document);
  return (
    <>
      <SiteBanner
        title={page.title}
        kind="docs"
        trail={docsTrail(page)}
        description={page.summary}
        corner={<PartSwitch page={page} />}
      />
      <Column gap={8} className="site-article docs-api">
        <CodeGuide document={document} />
        <WordsInCode document={document} />
        <Provides document={document} />
        {partsOfPage(page.kind, document.id).includes('palette') && <PaletteSection />}
      </Column>
    </>
  );
}

/**
 * A component's or a pattern's page in the Docs, its guide to using it in code, which complements
 * its page in the catalogue rather than repeating it: how to import it, its common uses, how its
 * parts compose and how to customize it, from the page's Compose; what the
 * application and envUI provide, which the catalogue leaves out; then, as reference, its props,
 * part names and color properties, and its changelog. It repeats no section of the catalogue and
 * shows no Related: the page goes from its header to Import and Usage, which a component's opens
 * with the component, live and compact: its catalogue's first overview example. Field, which has
 * no page in the catalogue, shows its whole page here, on the page, as "Build your own field".
 */
export function DocsReferencePage({ page }: { page: DocumentPage }) {
  const document = useDocument(page.document);
  const { cataloguePage, pattern } = catalogueKind(document);
  const metadata = document.metadata;
  // The guide, then once it has painted its reference, together: each step lays the whole page out
  // again, which costs more here than a step saves (useRevealed).
  const guide = useMemo(
    () => <CodeGuide document={document} showExample={!!cataloguePage && !pattern} />,
    [document, cataloguePage, pattern],
  );
  const parts = useMemo(
    () =>
      [
        cataloguePage && <WordsInCode key="words" document={document} />,
        cataloguePage && <Provides key="provides" document={document} />,
        !pattern && <PropsSection key="props" document={document} />,
        <PartNames key="parts" components={metadata?.components ?? []} />,
        <ColorProperties key="colors" components={metadata?.components ?? []} />,
        <Strings key="strings" document={document} />,
        <PageChangelog key="changelog" document={document} />,
      ].filter(Boolean),
    [document, cataloguePage, pattern, metadata],
  );
  const revealed = useRevealed(2);
  return (
    <>
      <SiteBanner
        title={page.title}
        kind="docs"
        trail={docsTrail(page)}
        description={page.summary}
        meta={metadata && <MetadataBadges metadata={metadata} />}
        corner={<PartSwitch page={page} />}
      />
      {/* Field, which has no page in the catalogue, shows the whole file, what envUI and the
          application provide in place. */}
      {!cataloguePage && <TemplateContent document={document} provides related={false} />}
      <Column gap={8} className="site-article docs-api" aria-busy={revealed < 2 || undefined}>
        {guide}
        {/* Until then, the reference is its outline, its headings hidden in place, which the
            page's contents list from the start (SectionOutline). */}
        <SectionOutline value={revealed < 2}>{parts}</SectionOutline>
      </Column>
    </>
  );
}

/** Whether a page in the Docs has a page in the catalogue, and whether that page is a pattern's. */
function catalogueKind(document: DocumentationEntry) {
  const cataloguePage = pagesOf('catalogue').find((entry) => entry.document?.id === document.id);
  return { cataloguePage, pattern: cataloguePage?.kind === 'pattern' };
}

/**
 * The sections of a page in the Docs, as its view renders them, for the page's contents to list
 * from the first render: each the id and words of its heading.
 */
export function docsContents(
  page: RoutePage,
  whole: DocumentationEntry | undefined,
): TableOfContentsItem[] {
  if (page.kind === 'docs-changelog') return [highlights, everyChange];
  if (page.kind === 'tokens') return tokenContents();
  if (!whole) return [];
  if (page.kind === 'guide') {
    const home = page.path === docsRoute;
    const { document, note } = guideParts(whole, home);
    return [...(home ? agentSetupContents(note) : []), ...guideContents(document)];
  }
  const words = wordsInCode(whole.sections) ? [docsHeadings.wordsInCode] : [];
  const provides = hasProvides(whole) ? [docsHeadings.provides] : [];
  if (page.kind === 'foundation-guide')
    return [
      ...codeGuideContents(whole),
      ...words,
      ...provides,
      ...(whole.id === 'colors' ? [docsHeadings.palette] : []),
    ];
  const { cataloguePage, pattern } = catalogueKind(whole);
  const components = whole.metadata?.components ?? [];
  const changelog = whole.sections?.find((section) => section.id === 'changelog');
  return [
    ...(cataloguePage ? [] : templateContents(whole, { provides: true, related: false })),
    ...codeGuideContents(whole),
    ...(cataloguePage ? [...words, ...provides] : []),
    ...(pattern ? [] : [docsHeadings.props]),
    ...(partEntries(components).length ? [docsHeadings.partNames] : []),
    ...(colorEntries(components).length ? [docsHeadings.colorProperties] : []),
    ...(whole.strings?.length ? [docsHeadings.strings] : []),
    ...(changelog ? [{ id: changelogId, label: changelog.title }] : []),
  ];
}
