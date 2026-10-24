import { Button, Column } from '@envsemble/envui';
import { Api } from '@envsemble/envui/icons/Api';
import { PageHeader } from '../layout/PageHeader';
import { apiRoute, patternGuideRoute, type SitePage } from '../navigation/DocumentationRoutes';
import { routeHref } from '../navigation/Address';
import { getReferenceIcon } from '../navigation/TopicIcons';
import { FoundationPreview } from '../previews/FoundationPreview';
import { MetadataBadges, TemplateContent } from '../template/TemplateContent';
import type { Reference } from '../Reference';
import { Catalogue } from './Catalogue';
import { Documentation } from './Documentation';
import { Benchmark } from './Benchmark';

/** The link from a page of the Site to its guide in the Docs, how to use it in code. */
function ApiLink({ path }: { path: string }) {
  return (
    <Button
      variant="secondary"
      size="sm"
      href={routeHref(path)}
      startIcon={<Api />}
      className="docs-api-link"
    >
      API
    </Button>
  );
}

/**
 * A component's page on the Site: what it looks like and when to use it, in live figures with the
 * code under each, and a link to its page in the Docs, its guide to using it in code with its
 * props, part names and changelog.
 */
export function ComponentPage({ page }: { page: SitePage }) {
  const document = page.document!;
  const reference = document as Reference;
  const Icon = getReferenceIcon(reference.id, reference.group);
  return (
    <>
      <PageHeader
        title={page.title}
        breadcrumb={`Components / ${page.group}`}
        description={page.summary}
        // The icon is looked up among module-level components, not created here.
        // eslint-disable-next-line react-hooks/static-components
        symbol={<Icon />}
        meta={
          document.metadata && (
            <MetadataBadges metadata={document.metadata}>
              <ApiLink path={apiRoute(document.id)} />
            </MetadataBadges>
          )
        }
      />
      <TemplateContent document={document} />
    </>
  );
}

/**
 * A pattern's page: every section of the template, in the page's order, and a link to its guide in
 * the Docs.
 */
export function PatternPage({ page }: { page: SitePage }) {
  const document = page.document!;
  return (
    <>
      <PageHeader
        title={page.title}
        breadcrumb={page.group ? `Patterns / ${page.group}` : 'Patterns'}
        description={page.summary}
        meta={
          document.metadata && (
            <MetadataBadges metadata={document.metadata}>
              <ApiLink path={patternGuideRoute(document.id)} />
            </MetadataBadges>
          )
        }
      />
      <TemplateContent document={document} />
    </>
  );
}

/**
 * The tokens a foundation's page names in a sentence, as Markdown, where its figures don't already
 * name them: the spacing, colors, stacking order, icons and motion figures show their tokens.
 */
const foundationTokens: Record<string, string> = {
  typography:
    'Type takes the `--env-type-*` and `--env-font-*` tokens, such as `--env-type-body` and `--env-font-weight-medium`.',
  scale:
    'Sizes that follow the scale are tokens, such as `--env-control-height-md`, `--env-row-height` and `--env-icon-size-md`, with a comfortable and a compact value.',
};

/**
 * A foundation's page on the Site: a short introduction, its visuals and, where its figures don't
 * name them, the tokens it uses in a sentence. Its written guidance is its guide in the Docs.
 */
export function FoundationPage({ page }: { page: SitePage }) {
  const reference = page.document as Reference;
  const Icon = getReferenceIcon(reference.id, reference.group);
  const tokens = foundationTokens[reference.id];
  return (
    <>
      <PageHeader
        title={page.title}
        breadcrumb="Foundations"
        description={page.summary}
        // eslint-disable-next-line react-hooks/static-components
        symbol={<Icon />}
      />
      <FoundationPreview id={reference.id} />
      {tokens && (
        <Column gap={4} className="docs-article docs-foundation-notes">
          <Documentation markdown={tokens} path={reference.path} />
        </Column>
      )}
    </>
  );
}

/** Every component, by what it is for. */
export function ComponentsPage({ page }: { page: SitePage }) {
  return (
    <>
      <PageHeader title={page.title} breadcrumb="Components" description={page.summary} />
      <Column gap={7} className="docs-article docs-overview">
        <Catalogue />
      </Column>
    </>
  );
}

/**
 * The benchmark's page: what it measures, the newest run's scores and the scores of every run, read
 * from bench/results when the site builds.
 */
export function BenchmarkPage({ page }: { page: SitePage }) {
  return (
    <>
      <PageHeader title={page.title} breadcrumb="Benchmark" description={page.summary} />
      <Benchmark />
    </>
  );
}
