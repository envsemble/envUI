import { Column, CopyButton, DescriptionList, Link, Row, Surface, Text } from '@envsemble/envui';
import { Code, Markdown } from '@envsemble/envui/content';
import { AgentLogos } from '../brand/AgentLogos';
import { EnvUIDocsLogo } from '../brand/EnvUIDocsLogo';
import { PageHeader } from '../layout/PageHeader';
import {
  docsTrail,
  docsTree,
  pagesOf,
  type DocsGroup,
  type RoutePage,
} from '../navigation/DocumentationRoutes';
import { routeHref } from '../navigation/Address';
import { OtherPartButton } from '../navigation/OtherPart';
import { lazyPart } from '../template/LoadBoundary';
import { ExampleSource } from '../template/LiveExample';
import { partsOf } from '../template/Parts';
import { providesOf } from '../template/Provides';
import { PropsTables } from '../template/PropsTables';
import { MetadataBadges, PageChangelog, TemplateContent } from '../template/TemplateContent';
import type { Documentation as Document, Reference } from '../Reference';
import { Documentation, GuidanceLists } from './Documentation';
import { GuideDocument } from './GuideDocument';
import { LoadedPart } from './LoadedPart';
import { ColorPalette } from '../previews/foundations/ColorPalette';
import { SpecimenHeadingLevel } from '../previews/Example';
import { ReleaseNotes } from './ReleaseNotes';
import { codeColumns, subsections } from '../../../../scripts/SiteContent.mjs';
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

/** A group's pages, one link to each, in a short list. */
function PageLinks({ pages }: { pages: readonly RoutePage[] }) {
  return (
    <ul className="docs-link-list">
      {pages.map((entry) => (
        <li key={entry.path}>
          <Link href={routeHref(entry.path)}>{entry.label ?? entry.title}</Link>
        </li>
      ))}
    </ul>
  );
}

/**
 * A section of the Docs' home, as their navigation has it: its pages, then its groups, each under
 * a heading of its own, which a page's breadcrumbs lead to.
 */
function HomeSection({ section, home }: { section: DocsGroup; home: RoutePage }) {
  const pages = section.pages.filter((entry) => entry !== home);
  return (
    <Column render={<section aria-labelledby={section.id} />} gap={4}>
      <Text render={<h2 id={section.id} />} variant="title">
        {section.label}
      </Text>
      {pages.length > 0 && <PageLinks pages={pages} />}
      {section.groups.map((group) => (
        <Column key={group.id} render={<section aria-labelledby={group.id} />} gap={2}>
          <Text render={<h3 id={group.id} />} variant="body-sm" emphasis="muted">
            {group.label}
          </Text>
          <PageLinks pages={group.pages} />
        </Column>
      ))}
    </Column>
  );
}

/**
 * The Docs' home: what they are, said once in its summary, the prompt that sets envUI up with a
 * coding agent, and each section's pages in short lists, by their groups, as the navigation has
 * them.
 */
export function DocsHome({ page }: { page: RoutePage }) {
  return (
    <>
      <PageHeader
        title={page.title}
        logo={<EnvUIDocsLogo />}
        description={page.summary}
        kind="docs-home"
      />
      <Column gap={7} className="docs-article">
        <Column
          render={<section aria-labelledby="agent-setup" />}
          gap={3}
          align="center"
          className="docs-agent-setup"
        >
          <Text render={<h2 id="agent-setup" />} variant="title">
            Set up with your agent
          </Text>
          <Text render={<p />} className="docs-agent-setup-text">
            Paste this into your coding agent. It shows you a short checklist, then installs envUI
            with its styles and theme, points your AGENTS.md to envUI's docs and turns on its lint
            rules. You can skip any step.
          </Text>
          <Surface
            background="muted"
            padding={1}
            render={<Row gap={3} align="center" />}
            className="docs-agent-prompt"
          >
            <AgentLogos className="docs-agent-logos" />
            <Text render={<code />} className="docs-agent-prompt-text">
              {setupPrompt}
            </Text>
            <CopyButton value={setupPrompt} variant="ghost" size="sm" aria-label="Copy prompt" />
          </Surface>
        </Column>
        {docsTree.map((section) => (
          <HomeSection key={section.id} section={section} home={page} />
        ))}
      </Column>
    </>
  );
}

/** A guide of docs/, such as setup or migration, with its live demos in place. */
export function GuidePage({ page }: { page: RoutePage }) {
  return (
    <>
      <PageHeader
        title={page.title}
        trail={docsTrail(page)}
        description={page.summary}
        kind="docs"
        meta={<OtherPartButton page={page} />}
      />
      <Column gap={7} className="docs-article">
        <GuideDocument document={page.document!} />
      </Column>
    </>
  );
}

/** The codemods' README, as the package ships it, without its title. */
export function CodemodsPage({ page }: { page: RoutePage }) {
  return (
    <>
      <PageHeader
        title={page.title}
        trail={docsTrail(page)}
        description={page.summary}
        kind="docs"
      />
      <Column gap={7} className="docs-article">
        <Markdown codeCopyable>{codemodsReadme.replace(/^# [^\n]*\n+/, '')}</Markdown>
      </Column>
    </>
  );
}

/** Every design token, with its value in each theme and scale. */
export function TokensPage({ page }: { page: RoutePage }) {
  return (
    <>
      <PageHeader
        title={page.title}
        trail={docsTrail(page)}
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
export function ChangelogDocsPage({ page }: { page: RoutePage }) {
  return (
    <>
      <PageHeader
        title={page.title}
        trail={docsTrail(page)}
        description={page.summary}
        kind="docs"
      />
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

/** Markdown without its "## Related topics", which the Docs leave out. */
function withoutRelatedTopics(markdown: string) {
  return markdown.replace(/^## Related topics\n[\s\S]*?(?=^## |(?![\s\S]))/m, '');
}

/**
 * A foundation's page in the Docs, the developer part its page in the Usage guide leaves out. In
 * the one-file structure, the same file as the Usage guide's page: Compose, what the application
 * and envUI provide, and the words of the page mapped to code. On the earlier template, its written
 * guidance and reference, whose visuals are its page in the Usage guide. Neither shows Related.
 */
export function FoundationGuidePage({ page }: { page: RoutePage }) {
  const document = page.document!;
  const header = (
    <PageHeader
      title={page.title}
      kind="docs"
      trail={docsTrail(page)}
      description={page.summary}
      meta={<OtherPartButton page={page} />}
    />
  );
  if (document.format === 'skill')
    return (
      <>
        {header}
        <Column gap={8} className="docs-article docs-api">
          <CodeGuide document={document} />
          <WordsInCode document={document} />
          <Provides document={document} title="Accessibility" id="provides" />
          {document.id === 'colors' && <PaletteSection />}
        </Column>
      </>
    );
  return (
    <>
      {header}
      {/* A foundation's written guidance: its lists are check lists. */}
      <Column gap={7} className="docs-article">
        <GuidanceLists value>
          <Documentation markdown={withoutRelatedTopics(document.markdown)} path={document.path} />
        </GuidanceLists>
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
  if (!entries.length) return null;
  return (
    <Column render={<section />} gap={5} aria-labelledby="part-names">
      <Text render={<h2 />} variant="headline" id="part-names">
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

/**
 * The words a page gives people, from its "## Words to use", each with the code it means: the
 * table's In code column, which the Usage guide leaves out, beside the words. Nothing where the
 * page has no such column.
 */
function WordsInCode({ document }: { document: Document }) {
  const section = document.sections?.find((item) => item.id === 'words');
  const markdown = codeColumns(
    (section?.blocks ?? [])
      .map((block) => (block.kind === 'markdown' ? block.markdown : ''))
      .join('\n'),
  );
  if (!markdown) return null;
  return (
    <Column render={<section />} gap={5} aria-labelledby="words-in-code">
      <Text render={<h2 />} variant="headline" id="words-in-code">
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
  if (!entries.length) return null;
  return (
    <Column render={<section />} gap={5} aria-labelledby="color-properties">
      <Text render={<h2 />} variant="headline" id="color-properties">
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
 * A component's or a pattern's page in the Docs, its guide to using it in code, which complements
 * its page in the Usage guide rather than repeating it: how to import it, its common uses, how its
 * parts compose and how to customize it, from the page's Compose or "## In code"; what the
 * application and envUI provide, which the Usage guide leaves out; then, as reference, its props,
 * part names and color properties, and its changelog. No figures of the Usage guide, no Related
 * and no band. Field, which has no page in the Usage guide, shows its whole page here, on the
 * page, as "Build your own field".
 */
export function DocsReferencePage({ page }: { page: RoutePage }) {
  const document = page.document!;
  const reference = document as Reference;
  const usagePage = pagesOf('usage').find((entry) => entry.document?.id === document.id);
  const metadata = document.metadata;
  const pattern = usagePage?.kind === 'pattern';
  return (
    <>
      <PageHeader
        title={page.title}
        kind="docs"
        trail={docsTrail(page)}
        description={page.summary}
        meta={
          metadata && (
            <MetadataBadges metadata={metadata}>
              <OtherPartButton page={page} />
            </MetadataBadges>
          )
        }
      />
      {/* Field, which has no page in the Usage guide, shows the whole file, what envUI and the
          application provide in place. */}
      {!usagePage && <TemplateContent document={document} provides related={false} bands={false} />}
      <Column gap={8} className="docs-article docs-api">
        <CodeGuide document={document} />
        {usagePage && <WordsInCode document={document} />}
        {usagePage && <Provides document={document} title="Accessibility" id="provides" />}
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
      </Column>
    </>
  );
}
