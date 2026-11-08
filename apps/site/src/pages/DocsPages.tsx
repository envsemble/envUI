import { useMemo } from 'react';
import { Column, Text } from '@envsemble/envui';
import { SiteBanner } from '../banner/SiteBanner';
import { pagesOf, type DocumentPage, type RoutePage } from '../routes/SiteRoutes';
import { docsTrail } from '../routes/Trails';
import { docsRoute } from '../routes/Address';
import { PartSwitch } from '../routes/OtherPart';
import { lazyPart } from '../loading/LoadBoundary';
import { MetadataBadges, PageChangelog, TemplateContent } from '../template/TemplateContent';
import { useRevealed } from '../template/useRevealed';
import { SectionOutline } from '../template/SectionOutline';
import { useDocument } from './PageContent';
import { GuideDocument } from './GuideDocument';
import { LoadedPart } from './LoadedPart';
import { ChangelogSkeleton } from './ChangelogOutline';
import { TokenReferenceSkeleton } from './TokenTables';
import { ReleaseNotes } from './ReleaseNotes';
import { AgentSetup } from './AgentSetup';
import {
  CodeGuide,
  ColorProperties,
  PaletteSection,
  PartNames,
  PropsSection,
  Provides,
  Strings,
  WordsInCode,
} from './DocsSections';
import { withoutAgentNote } from '@docs-model/DocsContent';

/*
 * The Docs' route views: a guide, the token reference, the changelog, a foundation's developer
 * part and a component's or a pattern's reference, each placing its sections (DocsSections.tsx).
 */

/** The token reference, a large page that loads with the page that shows it. */
const tokenReference = lazyPart(
  () => import('./TokenReference'),
  (module) => module.TokenReference,
  'src/pages/TokenReference.tsx',
);

/**
 * A guide of docs/, such as migration, with its figures in place. The setup guide is the Docs'
 * home, with the prompt that sets envUI up with a coding agent at its top.
 */
export function GuidePage({ page }: { page: DocumentPage }) {
  const whole = useDocument(page.document);
  const home = page.path === docsRoute;
  // On the Docs' home, the guide's note on coding agents moves up under the prompt.
  const { document, note } = useMemo(() => {
    const { markdown, note } = home ? withoutAgentNote(whole.markdown ?? '') : {};
    return { document: note ? { ...whole, markdown } : whole, note };
  }, [whole, home]);
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
          part={tokenReference}
          what="token reference"
          placeholder={<TokenReferenceSkeleton />}
        />
      </Column>
    </>
  );
}

/** The full changelog, a large page that loads with the page that shows it. */
const changelog = lazyPart(
  () => import('./Changelog'),
  (module) => module.Changelog,
  'src/pages/Changelog.tsx',
);

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
        <Column gap={6} render={<section aria-labelledby="highlights" />}>
          <Text render={<h2 id="highlights" />} variant="title" className="site-section-title">
            Highlights
          </Text>
          <ReleaseNotes />
        </Column>
        <Column gap={6} render={<section aria-labelledby="every-change" />}>
          <Text render={<h2 id="every-change" />} variant="title" className="site-section-title">
            Every change
          </Text>
          <LoadedPart part={changelog} what="changelog" placeholder={<ChangelogSkeleton />} />
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
        <Provides document={document} title="Accessibility" id="provides" />
        {document.id === 'colors' && <PaletteSection />}
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
  const cataloguePage = pagesOf('catalogue').find((entry) => entry.document?.id === document.id);
  const metadata = document.metadata;
  const pattern = cataloguePage?.kind === 'pattern';
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
        cataloguePage && (
          <Provides key="provides" document={document} title="Accessibility" id="provides" />
        ),
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
