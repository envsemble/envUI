import {
  Button,
  Column,
  CopyButton,
  DescriptionList,
  Link,
  Row,
  Surface,
  Text,
} from '@envsemble/envui';
import { Code, Markdown } from '@envsemble/envui/content';
import { Visibility } from '@envsemble/envui/icons/Visibility';
import { EnvUIDocsLogo } from '../brand/EnvUIDocsLogo';
import { PageHeader } from '../layout/PageHeader';
import { pagesOf, referencePages, type SitePage } from '../navigation/DocumentationRoutes';
import { routeHref } from '../navigation/Address';
import { lazyPart } from '../template/LoadBoundary';
import { ExampleSource } from '../template/LiveExample';
import { partsOf } from '../template/Parts';
import { providesOf } from '../template/Provides';
import { PropsTables } from '../template/PropsTables';
import { Related } from '../template/Related';
import { MetadataBadges, PageChangelog, TemplateContent } from '../template/TemplateContent';
import type { Documentation as Document, Reference } from '../Reference';
import { Documentation, GuidanceLists } from './Documentation';
import { GuideDocument } from './GuideDocument';
import { LoadedPart } from './LoadedPart';
import { ColorPalette } from '../previews/foundations/ColorPalette';
import { SpecimenHeadingLevel } from '../previews/Example';
import { ReleaseNotes } from './ReleaseNotes';
import { subsections } from '../../../../scripts/SiteContent.mjs';
import { headingSlug } from '../../../../scripts/SearchAnchors.mjs';
import codemodsReadme from '../../../../packages/codemods/README.md?raw';

/** The token reference, a large page that loads with the page that shows it. */
const tokenReference = lazyPart(
  () => import('./TokenReference'),
  (module) => module.TokenReference,
  'src/pages/TokenReference.tsx',
);

/** What people paste into a coding agent to set envUI up: the skill the site serves at /SKILL.md. */
export const setupPrompt = 'Set up envUI in my app: envui.envsemble.com/SKILL.md';

/**
 * The Docs' home: what they are, said once in its summary, the prompt that sets envUI up with a
 * coding agent, and each group's pages in a short list.
 */
export function DocsHome({ page }: { page: SitePage }) {
  const groups = new Map<string, SitePage[]>();
  for (const entry of pagesOf('docs'))
    if (entry !== page) groups.set(entry.section, [...(groups.get(entry.section) ?? []), entry]);
  return (
    <>
      <PageHeader
        title={page.title}
        logo={<EnvUIDocsLogo />}
        description={page.summary}
        kind="docs-home"
      />
      <Column gap={7} className="docs-article">
        <Column render={<section aria-labelledby="agent-setup" />} gap={3}>
          <Text render={<h2 id="agent-setup" />} variant="title">
            Set up with your agent
          </Text>
          <Text render={<p />}>
            Paste this into your coding agent. It shows you a short checklist, then installs envUI
            with its styles and theme, points your AGENTS.md to envUI's docs and turns on its lint
            rules. You can skip any step.
          </Text>
          <Surface
            background="muted"
            padding={3}
            render={<Row gap={3} align="center" justify="between" />}
            className="docs-agent-prompt"
          >
            <Text render={<p />}>{setupPrompt}</Text>
            <CopyButton value={setupPrompt} aria-label="Copy prompt" />
          </Surface>
        </Column>
        {[...groups].map(([group, entries]) => (
          <Column key={group} render={<section />} gap={3}>
            <Text render={<h2 />} variant="title">
              {group}
            </Text>
            <ul className="docs-link-list">
              {entries.map((entry) => (
                <li key={entry.path}>
                  <Link href={routeHref(entry.path)}>{entry.label ?? entry.title}</Link>
                </li>
              ))}
            </ul>
          </Column>
        ))}
      </Column>
    </>
  );
}

/** A guide of docs/, such as setup or migration, with its live demos in place. */
export function GuidePage({ page }: { page: SitePage }) {
  return (
    <>
      <PageHeader title={page.title} breadcrumb="Docs" description={page.summary} kind="docs" />
      <Column gap={7} className="docs-article">
        <GuideDocument document={page.document!} />
      </Column>
    </>
  );
}

/** The codemods' README, as the package ships it, without its title. */
export function CodemodsPage({ page }: { page: SitePage }) {
  return (
    <>
      <PageHeader title={page.title} breadcrumb="Docs" description={page.summary} kind="docs" />
      <Column gap={7} className="docs-article">
        <Markdown codeCopyable>{codemodsReadme.replace(/^# [^\n]*\n+/, '')}</Markdown>
      </Column>
    </>
  );
}

/** Every design token, with its value in each theme and scale. */
export function TokensPage({ page }: { page: SitePage }) {
  return (
    <>
      <PageHeader
        title={page.title}
        breadcrumb="Docs / Foundations"
        description={page.summary}
        kind="docs"
      />
      <Column gap={7} className="docs-article">
        <LoadedPart part={tokenReference} what="token reference" />
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
export function ChangelogDocsPage({ page }: { page: SitePage }) {
  return (
    <>
      <PageHeader title={page.title} breadcrumb="Docs" description={page.summary} kind="docs" />
      <Column gap={8} className="docs-article">
        <Column gap={6} render={<section aria-labelledby="highlights" />}>
          <Text render={<h2 id="highlights" />} variant="headline">
            Highlights
          </Text>
          <ReleaseNotes />
        </Column>
        <Column gap={6} render={<section aria-labelledby="every-change" />}>
          <Text render={<h2 id="every-change" />} variant="headline">
            Every change
          </Text>
          <LoadedPart part={changelog} what="changelog" />
        </Column>
      </Column>
    </>
  );
}

/** A link from a page of the Docs to the page of the Site that shows the same subject. */
function SiteLink({ path }: { path: string }) {
  return (
    <Button
      variant="secondary"
      size="sm"
      href={routeHref(path)}
      startIcon={<Visibility />}
      className="docs-site-link"
    >
      See it on the Site
    </Button>
  );
}

/**
 * The colors guide's editable palette: every role a component paints, by its token, with its value
 * in the current theme, each a swatch that picks another color for this visit.
 */
function PaletteSection() {
  return (
    <Column render={<section />} gap={5} aria-labelledby="palette">
      <Text render={<h2 />} variant="headline" id="palette">
        Try the palette
      </Text>
      <Text emphasis="muted">
        Each swatch shows a token&apos;s value in the theme you are reading in. Press one to pick
        another color: the whole catalogue follows, in this theme only, until you reload.
      </Text>
      <SpecimenHeadingLevel value={3}>
        <ColorPalette />
      </SpecimenHeadingLevel>
    </Column>
  );
}

/** A foundation's written guidance and reference, whose visuals are its page on the Site. */
export function FoundationGuidePage({ page }: { page: SitePage }) {
  const document = page.document!;
  const sitePage = referencePages.find((entry) => entry.reference.id === document.id);
  return (
    <>
      <PageHeader
        title={page.title}
        kind="docs"
        breadcrumb="Docs / Foundations"
        description={page.summary}
        meta={sitePage && <SiteLink path={sitePage.path} />}
      />
      {/* A foundation's written guidance: its lists are check lists. */}
      <Column gap={7} className="docs-article">
        <GuidanceLists value>
          <Documentation document={document} />
        </GuidanceLists>
        {document.id === 'colors' && <PaletteSection />}
      </Column>
    </>
  );
}

/** The part names and state attributes of the exports a page documents, as simple lists. */
function PartNames({ components }: { components: readonly string[] }) {
  const entries = components.flatMap((name) => {
    const parts = partsOf(name);
    return parts ? [{ name, parts }] : [];
  });
  if (!entries.length) return null;
  return (
    <Column render={<section />} gap={5} aria-labelledby="parts">
      <Text render={<h2 />} variant="headline" id="parts">
        Part names
      </Text>
      <Text emphasis="muted">
        Each part&apos;s class and state attributes are public and versioned, for an
        application&apos;s CSS to style.
      </Text>
      {entries.map(({ name, parts }) => (
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
                {state.values.length
                  ? state.values.map((value, index) => (
                      <span key={value}>
                        {index > 0 && ' · '}
                        <Code>{value}</Code>
                      </span>
                    ))
                  : 'Present or absent'}
                {state.parts.length > 1 || state.parts[0] !== parts.root
                  ? ` on ${state.parts.join(', ')}`
                  : ''}
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
  if (!envui && !app) return null;
  return (
    <Column render={<section />} gap={5} aria-labelledby={id} className="docs-provides">
      <Text render={<h2 />} variant="headline" id={id}>
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
 * A page's developer-only part, its "## In code" section, cut into its `###` subsections: the
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
 * The guide at the top of a page in the Docs, from the page's "## In code": how to import it, its
 * common uses in code, how its parts compose and how to customize it, each a section of its own,
 * with an example file of the page shown as code where the page names one.
 */
function CodeGuide({ document }: { document: Document }) {
  return guideSubsections(document).map(({ title, content }) => {
    const id = headingSlug(title);
    return (
      <Column key={title} render={<section />} gap={5} aria-labelledby={id} className="docs-guide">
        <Text render={<h2 />} variant="headline" id={id}>
          {title}
        </Text>
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

/** The color properties of the exports a page documents, from docs/generated/parts.json. */
function ColorProperties({ components }: { components: readonly string[] }) {
  const entries = components.flatMap((name) => {
    const colors = partsOf(name)?.colors ?? [];
    return colors.length ? [{ name, colors }] : [];
  });
  if (!entries.length) return null;
  return (
    <Column render={<section />} gap={5} aria-labelledby="colors">
      <Text render={<h2 />} variant="headline" id="colors">
        Color properties
      </Text>
      <Text emphasis="muted">
        Each sets a color of one instance, through <Code>style</Code> or CSS; its hover, focus and
        press follow it. They are public and versioned.
      </Text>
      {entries.map(({ name, colors }) => (
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

/**
 * A component's or a pattern's page in the Docs, its guide to using it in code: how to import it,
 * its common uses, how its parts compose and how to customize it, from the page's "## In code";
 * what the application and envUI provide; then, as reference, its props, part names and color
 * properties, and its changelog. Field, which has no page on the Site, shows its whole page here,
 * as "Build your own field", with Related at the end, after the changelog.
 */
export function ApiPage({ page }: { page: SitePage }) {
  const document = page.document!;
  const reference = document as Reference;
  const sitePage = pagesOf('site').find((entry) => entry.document?.id === document.id);
  const metadata = document.metadata;
  const pattern = sitePage?.kind === 'pattern';
  return (
    <>
      <PageHeader
        title={page.title}
        kind="docs"
        breadcrumb={`Docs / ${pattern ? 'Patterns' : reference.group}`}
        description={page.summary}
        meta={
          metadata && (
            <MetadataBadges metadata={metadata}>
              {sitePage && <SiteLink path={sitePage.path} />}
            </MetadataBadges>
          )
        }
      />
      {!sitePage && <TemplateContent document={document} provides related={false} />}
      <Column gap={8} className="docs-article docs-api">
        <CodeGuide document={document} />
        {sitePage && <Provides document={document} title="Accessibility" id="provides" />}
        {!pattern && (
          <Column render={<section />} gap={5} aria-labelledby="props">
            <Text render={<h2 />} variant="headline" id="props">
              Props
            </Text>
            <PropsTables reference={reference} />
          </Column>
        )}
        <PartNames components={metadata?.components ?? []} />
        <ColorProperties components={metadata?.components ?? []} />
        <PageChangelog document={document} />
        {!sitePage && metadata && <Related metadata={metadata} path={document.path} />}
      </Column>
    </>
  );
}
