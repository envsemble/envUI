import { useMemo } from 'react';
import { Column, Text, type TableOfContentsItem } from '@envsemble/envui';
import type { DocumentationEntry } from '../../documentation/DocumentationTypes';
import { SiteBanner } from '../../frame/SiteBanner';
import { pagesOf, type DocumentPage, type RoutePage } from '../../routes/SiteRoutes';
import { docsTrail } from '../../routes/Trails';
import { docsRoute } from '../../routes/Address';
import {
  changelogId,
  PageChangelog,
  TemplateContent,
  templateContents,
} from '../../template/TemplateContent';
import { useRevealed } from '../../template/useRevealed';
import { SectionOutline } from '../../markdown/SectionOutline';
import { GuideDocument, guideContents } from './GuideDocument';
import { LoadedPart } from '../../loading/LoadedPart';
import { useDocument } from '../PageContent';
import { pageParts, partsOfPage } from '../PageParts';
import { ChangelogSkeleton, releaseContents } from './ChangelogOutline';
import { tokenContents, TokenReferenceSkeleton } from './TokenTables';
import { ReleaseNotes } from './ReleaseNotes';
import { AgentSetup, agentSetupContents } from './AgentSetup';
import { legalContents } from './LegalPages';
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
import { wordsInCode, withoutAgentNote } from '../../documentation/DocsContent';

function guideParts(whole: DocumentationEntry, home: boolean) {
  const { markdown, note } = home ? withoutAgentNote(whole.markdown ?? '') : {};
  return { document: note ? { ...whole, markdown } : whole, note };
}

export function GuidePage({ page }: { page: DocumentPage }) {
  const whole = useDocument(page.document);
  const home = page.path === docsRoute;
  const { document, note } = useMemo(() => guideParts(whole, home), [whole, home]);
  return (
    <>
      <SiteBanner
        page={page}
        title={page.title}
        trail={docsTrail(page)}
        description={page.summary}
        kind="docs"
      />
      <Column gap={7} className="site-article">
        {home && <AgentSetup note={note} path={whole.path} />}
        <GuideDocument document={document} />
      </Column>
    </>
  );
}

export function TokensPage({ page }: { page: RoutePage }) {
  return (
    <>
      <SiteBanner
        page={page}
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

export function LegalPage({ page }: { page: RoutePage }) {
  return (
    <>
      <SiteBanner title={page.title} breadcrumb="envUI" kind="docs" page={page} />
      <Column gap={6} className="site-article">
        {legalContents[page.path as keyof typeof legalContents]}
      </Column>
    </>
  );
}

const highlights = { id: 'highlights', label: 'Highlights' };
const everyChange = { id: 'every-change', label: 'Every change' };

export function ChangelogDocsPage({ page }: { page: RoutePage }) {
  return (
    <>
      <SiteBanner
        page={page}
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

export function FoundationGuidePage({ page }: { page: DocumentPage }) {
  const document = useDocument(page.document);
  return (
    <>
      <SiteBanner
        page={page}
        title={page.title}
        kind="docs"
        trail={docsTrail(page)}
        description={page.summary}
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

const guideThenReference = 2;

export function DocsReferencePage({ page }: { page: DocumentPage }) {
  const document = useDocument(page.document);
  const cataloguePage = cataloguePageOf(document);
  const metadata = document.metadata;
  const guide = useMemo(
    () => <CodeGuide document={document} showExample={!!cataloguePage} />,
    [document, cataloguePage],
  );
  const parts = useMemo(
    () =>
      [
        cataloguePage && <WordsInCode key="words" document={document} />,
        cataloguePage && <Provides key="provides" document={document} />,
        <PropsSection key="props" document={document} />,
        <PartNames key="parts" components={metadata?.components ?? []} />,
        <ColorProperties key="colors" components={metadata?.components ?? []} />,
        <Strings key="strings" document={document} />,
        <PageChangelog key="changelog" document={document} />,
      ].filter(Boolean),
    [document, cataloguePage, metadata],
  );
  const referencePending = useRevealed(guideThenReference) < guideThenReference;
  return (
    <>
      <SiteBanner
        page={page}
        title={page.title}
        kind="docs"
        trail={docsTrail(page)}
        description={page.summary}
      />
      {!cataloguePage && <TemplateContent document={document} provides related={false} />}
      <Column gap={8} className="site-article docs-api" aria-busy={referencePending || undefined}>
        {guide}
        <SectionOutline value={referencePending}>{parts}</SectionOutline>
      </Column>
    </>
  );
}

const cataloguePageOf = (document: DocumentationEntry) =>
  pagesOf('catalogue').find((entry) => entry.document?.id === document.id);

export function docsContents(
  page: RoutePage,
  whole: DocumentationEntry | undefined,
): TableOfContentsItem[] {
  if (page.kind === 'docs-changelog')
    return [highlights, { ...everyChange, children: releaseContents() }];
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
  const cataloguePage = cataloguePageOf(whole);
  const components = whole.metadata?.components ?? [];
  const changelog = whole.sections?.find((section) => section.id === 'changelog');
  return [
    ...(cataloguePage ? [] : templateContents(whole, { provides: true, related: false })),
    ...codeGuideContents(whole),
    ...(cataloguePage ? [...words, ...provides] : []),
    docsHeadings.props,
    ...(partEntries(components).length ? [docsHeadings.partNames] : []),
    ...(colorEntries(components).length ? [docsHeadings.colorProperties] : []),
    ...(whole.strings?.length ? [docsHeadings.strings] : []),
    ...(changelog ? [{ id: changelogId, label: changelog.title }] : []),
  ];
}
