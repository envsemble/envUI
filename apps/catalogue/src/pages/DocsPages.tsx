import { Button, Column, DescriptionList, Link, Tabs, Text } from '@envsemble/envui';
import { Code, Markdown, type MarkdownLinkProps } from '@envsemble/envui/content';
import { Visibility } from '@envsemble/envui/icons/Visibility';
import { PageHeader } from '../layout/PageHeader';
import { pagesOf, referencePages, type SitePage } from '../navigation/DocumentationRoutes';
import { routeHref } from '../navigation/Address';
import { currentRouteQuery, useViewTabs } from '../navigation/useDocumentationRoute';
import { lazyPart } from '../template/LoadBoundary';
import { partsOf } from '../template/Parts';
import { PropsTables } from '../template/PropsTables';
import { MetadataBadges, PageChangelog, TemplateContent } from '../template/TemplateContent';
import type { Reference } from '../Reference';
import { Documentation } from './Documentation';
import { GuideDocument } from './GuideDocument';
import { LoadedPart } from './LoadedPart';
import codemodsReadme from '../../../../packages/codemods/README.md?raw';
import usageSkill from '../../../../.agents/skills/envui-use/SKILL.md?raw';
import migrationSkill from '../../../../.agents/skills/envui-migrate/SKILL.md?raw';

/** The token reference, a large page that loads with the page that shows it. */
const tokenReference = lazyPart(
  () => import('./TokenReference'),
  (module) => module.TokenReference,
  'src/pages/TokenReference.tsx',
);

/** The Docs' home: what they hold, each page of a group in a short list. */
export function DocsHome({ page }: { page: SitePage }) {
  const groups = new Map<string, SitePage[]>();
  for (const entry of pagesOf('docs'))
    if (entry !== page) groups.set(entry.section, [...(groups.get(entry.section) ?? []), entry]);
  return (
    <>
      <PageHeader title={page.title} breadcrumb="Docs" description={page.summary} />
      <Column gap={7} className="docs-article">
        <Text>
          The Docs are the developer reference for envUI: how to install and set it up, migrate an
          interface and upgrade with the codemods, the design tokens, dev mode, the tools for coding
          agents, and every component&apos;s props, part names and changelog. The{' '}
          <Link href={routeHref('overview')}>Site</Link> shows what each component looks like and
          when to use it.
        </Text>
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
      <PageHeader title={page.title} breadcrumb="Docs" description={page.summary} />
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
      <PageHeader title={page.title} breadcrumb="Docs" description={page.summary} />
      <Column gap={7} className="docs-article">
        <Markdown codeCopyable>{codemodsReadme.replace(/^# [^\n]*\n+/, '')}</Markdown>
      </Column>
    </>
  );
}

function skillBody(source: string) {
  return source.replace(/^---\r?\n[\s\S]*?\r?\n---\s*/, '');
}

/** The skills shown, by the folder their links name, such as `../envui-migrate/SKILL.md`. */
const skillTabsByFolder: Record<string, string> = {
  'envui-use': 'use',
  'envui-migrate': 'migrate',
};

/** A skill's link to another skill opens its tab; one to a skill not shown, its file. */
function renderSkillLink({ href, ...props }: MarkdownLinkProps) {
  const folder = href?.match(/^\.\.\/([^/]+)\/SKILL\.md$/)?.[1];
  if (!folder) return <Link {...props} href={href} />;
  const skill = skillTabsByFolder[folder];
  return (
    <Link
      {...props}
      href={
        skill
          ? routeHref(`docs/agent-skills?skill=${skill}`)
          : `https://github.com/envsemble/envUI/blob/main/.agents/skills/${folder}/SKILL.md`
      }
    />
  );
}

/** The skills the package ships for coding agents, from the same Markdown the agents read. */
export function SkillsPage({ page }: { page: SitePage }) {
  const selected = currentRouteQuery().get('skill') === 'migrate' ? 'migrate' : 'use';
  const tabs = useViewTabs((value) => `docs/agent-skills?skill=${value}`);
  return (
    <>
      <PageHeader title={page.title} breadcrumb="Docs" description={page.summary} />
      <Column gap={7} className="docs-article">
        <Tabs
          aria-label="Agent skills"
          value={selected}
          {...tabs}
          items={[
            {
              value: 'use',
              button: <Button>Use envUI</Button>,
              content: (
                <Markdown headingOffset={1} codeCopyable renderLink={renderSkillLink}>
                  {skillBody(usageSkill)}
                </Markdown>
              ),
            },
            {
              value: 'migrate',
              button: <Button>Migrate to envUI</Button>,
              content: (
                <Markdown headingOffset={1} codeCopyable renderLink={renderSkillLink}>
                  {skillBody(migrationSkill)}
                </Markdown>
              ),
            },
          ]}
        />
      </Column>
    </>
  );
}

/** Every design token, with its value in each theme and scale. */
export function TokensPage({ page }: { page: SitePage }) {
  return (
    <>
      <PageHeader title={page.title} breadcrumb="Docs / Foundations" description={page.summary} />
      <Column gap={7} className="docs-article">
        <LoadedPart part={tokenReference} what="token reference" />
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

/** A foundation's written guidance and reference, whose visuals are its page on the Site. */
export function FoundationGuidePage({ page }: { page: SitePage }) {
  const document = page.document!;
  const sitePage = referencePages.find((entry) => entry.reference.id === document.id);
  return (
    <>
      <PageHeader
        title={page.title}
        breadcrumb="Docs / Foundations"
        description={page.summary}
        meta={sitePage && <SiteLink path={sitePage.path} />}
      />
      <Column gap={7} className="docs-article">
        <Documentation document={document} />
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
 * A component's page in the Docs: its props, part names and changelog. Field, which has no page on
 * the Site, shows its whole page here, as "Build your own field".
 */
export function ApiPage({ page }: { page: SitePage }) {
  const document = page.document!;
  const reference = document as Reference;
  const sitePage = referencePages.find(
    (entry) => entry.reference.id === document.id && !entry.path.startsWith('docs/'),
  );
  const metadata = document.metadata;
  return (
    <>
      <PageHeader
        title={page.title}
        breadcrumb={`Docs / ${reference.group}`}
        description={page.summary}
        meta={
          metadata && (
            <MetadataBadges metadata={metadata}>
              {sitePage && <SiteLink path={sitePage.path} />}
            </MetadataBadges>
          )
        }
      />
      {!sitePage && <TemplateContent document={document} />}
      <Column gap={8} className="docs-article docs-api">
        <Column render={<section />} gap={5} aria-labelledby="props">
          <Text render={<h2 />} variant="headline" id="props">
            Props
          </Text>
          <PropsTables reference={reference} />
        </Column>
        <PartNames components={metadata?.components ?? []} />
        <PageChangelog document={document} />
      </Column>
    </>
  );
}
