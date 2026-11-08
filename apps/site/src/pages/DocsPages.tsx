import { Fragment, useMemo } from 'react';
import { Column, CopyButton, DescriptionList, Row, Surface, Text } from '@envsemble/envui';
import { Code } from '@envsemble/envui/content';
import { AgentLogos } from '../brand/AgentLogos';
import { SiteBanner } from '../layout/SiteBanner';
import { pagesOf, type DocumentPage, type RoutePage } from '../navigation/SiteRoutes';
import { docsTrail } from '../navigation/Trails';
import { docsRoute } from '../navigation/Address';
import { PartSwitch } from '../navigation/OtherPart';
import { lazyPart } from '../template/LoadBoundary';
import { ExampleSource } from '../figures/LiveExample';
import { UsagePreview } from '../figures/Figures';
import { partsOf } from '../template/Parts';
import { providesOf } from '../template/Provides';
import { PropsTables } from '../template/PropsTables';
import { MetadataBadges, PageChangelog, TemplateContent } from '../template/TemplateContent';
import type { Documentation as Document } from './PageModel';
import { useDocument } from './PageContent';
import { useRevealed } from '../template/useRevealed';
import { pendingAttribute, SectionOutline, useSectionOutline } from '../template/SectionOutline';
import { Documentation } from './Documentation';
import { GuideDocument } from './GuideDocument';
import { LoadedPart } from './LoadedPart';
import { ChangelogSkeleton } from './ChangelogOutline';
import { TokenReferenceSkeleton } from './TokenTables';
import { ColorPaletteSkeleton } from '../figures/foundations/ColorPaletteSkeleton';
import { SpecimenHeadingLevel } from '../figures/Example';
import { ReleaseNotes } from './ReleaseNotes';
import { codeColumns, subsections } from '../shared/CatalogueContent';
import { headingSlug } from '../shared/SearchAnchors';

/** The token reference, a large page that loads with the page that shows it. */
const tokenReference = lazyPart(
  () => import('./TokenReference'),
  (module) => module.TokenReference,
  'src/pages/TokenReference.tsx',
);

/** The palette's swatches, with their color picker, which load with the page that shows them. */
const colorPalette = lazyPart(
  () => import('../figures/foundations/ColorPalette'),
  (module) => module.ColorPalette,
  'src/figures/foundations/ColorPalette.tsx',
);

/** What people paste into a coding agent to set envUI up: the skill the site serves at /SKILL.md. */
export const setupPrompt = 'Set up envUI in my app: envui.envsemble.com/SKILL.md';

/** The setup guide's closing note on coding agents, which the Docs' home shows under its prompt. */
const agentNote = /^## Coding agents\n([\s\S]*?)(?=^## |(?![\s\S]))/m;

/**
 * The prompt that sets envUI up with a coding agent, centred at the top of the Docs' home, the setup
 * guide, whose sections set it up by hand; under it, the guide's note on what the agent does, which
 * keeps its old address (`coding-agents`) for the links and search results that lead to it.
 */
function AgentSetup({ note, path = '' }: { note?: string; path?: string }) {
  return (
    <Column
      render={<section aria-labelledby="agent-setup" />}
      gap={3}
      align="center"
      className="docs-agent-setup"
    >
      <Text render={<h2 id="agent-setup" />} variant="title" className="site-section-title">
        Set up with your agent
      </Text>
      <Text render={<p />} className="docs-agent-setup-text">
        Paste this into your coding agent, or follow the steps below by hand.
      </Text>
      <Surface
        background="muted"
        padding={1}
        render={<Row gap={3} align="center" />}
        className="docs-agent-prompt"
      >
        <AgentLogos className="docs-agent-logos" />
        <Text render={<code />} className="docs-agent-prompt-text">
          {/* Where it wraps, as on a phone, the address breaks after a slash. */}
          {setupPrompt.split('/').map((piece, index) => (
            <Fragment key={index}>
              {index > 0 && (
                <>
                  /<wbr />
                </>
              )}
              {piece}
            </Fragment>
          ))}
        </Text>
        <CopyButton value={setupPrompt} variant="ghost" size="sm" aria-label="Copy prompt" />
      </Surface>
      {note && (
        <div id="coding-agents" className="docs-agent-note">
          <Documentation markdown={note} path={path} />
        </div>
      )}
    </Column>
  );
}

/**
 * A guide of docs/, such as migration, with its live demos in place. The setup guide is the Docs'
 * home, with the prompt that sets envUI up with a coding agent at its top.
 */
export function GuidePage({ page }: { page: DocumentPage }) {
  const whole = useDocument(page.document);
  const home = page.path === docsRoute;
  // On the Docs' home, the guide's note on coding agents moves up under the prompt.
  const note = home ? whole.markdown?.match(agentNote)?.[1]?.trim() : undefined;
  const document = useMemo(
    () => (note ? { ...whole, markdown: whole.markdown!.replace(agentNote, '') } : whole),
    [whole, note],
  );
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
 * The colors guide's editable palette: every role a component paints, by its token, with its value
 * in the current theme, each a swatch that picks another color for this visit.
 */
function PaletteSection() {
  return (
    <Column render={<section />} gap={5} aria-labelledby="palette">
      <Text render={<h2 />} variant="title" className="site-section-title" id="palette">
        Try the palette
      </Text>
      <Text emphasis="muted">
        Each swatch shows a token&apos;s value in the theme you are reading in. Press one to pick
        another color: the whole catalogue follows, in this theme only, until you reload.
      </Text>
      <SpecimenHeadingLevel value={3}>
        <LoadedPart part={colorPalette} what="palette" placeholder={<ColorPaletteSkeleton />} />
      </SpecimenHeadingLevel>
    </Column>
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
 * The values a state attribute takes: each as code, except the empty value of an attribute set
 * without one, which reads as Present; with no values listed, any value or presence alone selects it.
 */
function StateValues({ values }: { values: readonly string[] }) {
  if (!values.length) return <>Any value, or present</>;
  return values.map((value, index) => (
    <span key={value}>
      {index > 0 && ' · '}
      {value === '' ? 'Present' : <Code>{value}</Code>}
    </span>
  ));
}

/** The part names and state attributes of the exports a page documents, as simple lists. */
function PartNames({ components }: { components: readonly string[] }) {
  const entries = components.flatMap((name) => {
    const parts = partsOf(name);
    return parts ? [{ name, parts }] : [];
  });
  const outline = useSectionOutline();
  if (!entries.length) return null;
  return (
    <Column
      render={<section />}
      gap={5}
      aria-labelledby="part-names"
      {...pendingAttribute(outline)}
    >
      <Text render={<h2 />} variant="title" className="site-section-title" id="part-names">
        Part names
      </Text>
      <Text emphasis="muted">
        Each part&apos;s class and state attributes are public and versioned, for an
        application&apos;s CSS to style.
      </Text>
      {!outline &&
        entries.map(({ name, parts }) => (
          <Column key={name} gap={3}>
            {entries.length > 1 && (
              <Text render={<h3 />} variant="title">
                <Code>{name}</Code>
              </Text>
            )}
            <DescriptionList.Root className="docs-parts">
              {parts.parts.map((part) => (
                <DescriptionList.Item key={part.class} label={<Code>{part.class}</Code>}>
                  {part.description}
                </DescriptionList.Item>
              ))}
              {parts.states.map((state) => (
                <DescriptionList.Item key={state.attribute} label={<Code>{state.attribute}</Code>}>
                  <StateValues values={state.values} />
                  {state.parts.length > 1 || state.parts[0] !== parts.root ? (
                    <Text render={<span />} emphasis="muted">
                      {` on ${state.parts.join(', ')}`}
                    </Text>
                  ) : null}
                </DescriptionList.Item>
              ))}
            </DescriptionList.Root>
          </Column>
        ))}
    </Column>
  );
}

/**
 * What an application adds for a component or pattern to be accessible, and what envUI does for
 * it, as the Accessibility section of its page writes them: plain lists under a heading, `title`,
 * of the section's own.
 */
function Provides({ document, title, id }: { document: Document; title: string; id: string }) {
  const { envui, app } = providesOf(document.sections ?? []);
  const outline = useSectionOutline();
  if (!envui && !app) return null;
  return (
    <Column
      render={<section />}
      gap={5}
      aria-labelledby={id}
      className="docs-provides"
      {...pendingAttribute(outline)}
    >
      <Text render={<h2 />} variant="title" className="site-section-title" id={id}>
        {title}
      </Text>
      {app && (
        <Column gap={3}>
          <Text render={<h3 />} variant="title">
            You provide
          </Text>
          <Documentation markdown={app} path={document.path} />
        </Column>
      )}
      {envui && (
        <Column gap={3}>
          <Text render={<h3 />} variant="title">
            envUI provides
          </Text>
          <Documentation markdown={envui} path={document.path} />
        </Column>
      )}
    </Column>
  );
}

/** Markdown with its `####` and deeper headings raised a level, outside code fences. */
function raisedHeadings(markdown: string) {
  let fence: string | undefined;
  return markdown
    .split('\n')
    .map((line) => {
      const marker = line.match(/^\s{0,3}(`{3,}|~{3,})/)?.[1];
      if (marker && (!fence || (marker[0] === fence[0] && marker.length >= fence.length)))
        fence = fence ? undefined : marker;
      return !fence && /^#{4,6} /.test(line) ? line.slice(1) : line;
    })
    .join('\n');
}

type GuidePart = { kind: 'markdown'; markdown: string } | { kind: 'source'; name: string };

/**
 * A page's developer part, its "## Compose" section, cut into its `###` subsections: the
 * generated Import, then Usage, Composition and Customize as the page writes them.
 */
function guideSubsections(document: Document) {
  const section = document.sections?.find((item) => item.id === 'code');
  const parts: { title: string; content: GuidePart[] }[] = [];
  for (const block of section?.blocks ?? []) {
    if (block.kind === 'source') parts.at(-1)?.content.push(block);
    if (block.kind !== 'markdown') continue;
    for (const chunk of subsections(block.markdown)) {
      const title = /^### (.*)/.exec(chunk)?.[1].trim();
      if (title) parts.push({ title, content: [] });
      const body = chunk.replace(/^#{2,3} .*\n/, '');
      if (body.trim()) parts.at(-1)?.content.push({ kind: 'markdown', markdown: body });
    }
  }
  return parts;
}

/**
 * The guide at the top of a page in the Docs, from the page's "## Compose": how to import it, its
 * common uses in code, how its parts compose and how to customize it, each a section of its own,
 * with an example file of the page shown as code where the page names one. With `showExample`, as a
 * component's, Usage opens with the component, live and compact (UsagePreview).
 */
function CodeGuide({
  document,
  showExample = false,
}: {
  document: Document;
  showExample?: boolean;
}) {
  return guideSubsections(document).map(({ title, content }) => {
    const id = headingSlug(title);
    return (
      <Column key={title} render={<section />} gap={5} aria-labelledby={id} className="docs-guide">
        <Text render={<h2 />} variant="title" className="site-section-title" id={id}>
          {title}
        </Text>
        {showExample && title === 'Usage' && <UsagePreview page={document} />}
        {content.map((part, index) =>
          part.kind === 'source' ? (
            <ExampleSource key={index} page={document.id} name={part.name} />
          ) : (
            <Documentation
              key={index}
              markdown={raisedHeadings(part.markdown)}
              path={document.path}
            />
          ),
        )}
      </Column>
    );
  });
}

/**
 * The words a page gives people, from its "## Words to use", each with the code it means: the
 * table's In code column, which the catalogue leaves out, beside the words. Nothing where the
 * page has no such column.
 */
function WordsInCode({ document }: { document: Document }) {
  const section = document.sections?.find((item) => item.id === 'words');
  const markdown = codeColumns(
    (section?.blocks ?? [])
      .map((block) => (block.kind === 'markdown' ? block.markdown : ''))
      .join('\n'),
  );
  const outline = useSectionOutline();
  if (!markdown) return null;
  return (
    <Column
      render={<section />}
      gap={5}
      aria-labelledby="words-in-code"
      {...pendingAttribute(outline)}
    >
      <Text render={<h2 />} variant="title" className="site-section-title" id="words-in-code">
        Words in code
      </Text>
      <Documentation markdown={markdown} path={document.path} />
    </Column>
  );
}

/** The color properties of the exports a page documents, from docs/generated/parts.json. */
function ColorProperties({ components }: { components: readonly string[] }) {
  const entries = components.flatMap((name) => {
    const colors = partsOf(name)?.colors ?? [];
    return colors.length ? [{ name, colors }] : [];
  });
  const outline = useSectionOutline();
  if (!entries.length) return null;
  return (
    <Column
      render={<section />}
      gap={5}
      aria-labelledby="color-properties"
      {...pendingAttribute(outline)}
    >
      <Text render={<h2 />} variant="title" className="site-section-title" id="color-properties">
        Color properties
      </Text>
      <Text emphasis="muted">
        Each sets a color of one instance, through <Code>style</Code> or CSS; its hover, focus and
        press follow it. They are public and versioned.
      </Text>
      {!outline &&
        entries.map(({ name, colors }) => (
          <Column key={name} gap={3}>
            {entries.length > 1 && (
              <Text render={<h3 />} variant="title">
                <Code>{name}</Code>
              </Text>
            )}
            <DescriptionList.Root className="docs-parts">
              {colors.map((color) => (
                <DescriptionList.Item key={color.property} label={<Code>{color.property}</Code>}>
                  {color.description}
                </DescriptionList.Item>
              ))}
            </DescriptionList.Root>
          </Column>
        ))}
    </Column>
  );
}

/** Every export's props, generated from their types, under Props. */
function PropsSection({ document }: { document: Document }) {
  return (
    <Column
      render={<section />}
      gap={5}
      aria-labelledby="props"
      {...pendingAttribute(useSectionOutline())}
    >
      <Text render={<h2 />} variant="title" className="site-section-title" id="props">
        Props
      </Text>
      <PropsTables document={document} />
    </Column>
  );
}

/** The built-in strings a page's exports show, each a key of EnvUIProvider's `messages`. */
function Strings({ document }: { document: Document }) {
  const strings = document.strings ?? [];
  const outline = useSectionOutline();
  if (!strings.length) return null;
  return (
    <Column render={<section />} gap={5} aria-labelledby="strings" {...pendingAttribute(outline)}>
      <Text render={<h2 />} variant="title" className="site-section-title" id="strings">
        Strings
      </Text>
      <Text emphasis="muted">
        EnvUIProvider&apos;s <Code>messages</Code> overrides each, and a component&apos;s own label
        prop wins over it.
      </Text>
      {!outline && (
        <DescriptionList.Root className="docs-parts">
          {strings.map((string) => (
            <DescriptionList.Item
              key={`${string.namespace}.${string.key}`}
              label={<Code>{`messages.${string.namespace}.${string.key}`}</Code>}
            >
              <Code>{string.value}</Code> {string.description}
            </DescriptionList.Item>
          ))}
        </DescriptionList.Root>
      )}
    </Column>
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
