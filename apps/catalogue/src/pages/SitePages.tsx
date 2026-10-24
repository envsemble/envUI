import { Button, Column, Link, Text } from '@envsemble/envui';
import { Api } from '@envsemble/envui/icons/Api';
import { PageHeader } from '../layout/PageHeader';
import { apiRoute, foundationGuideRoute, type SitePage } from '../navigation/DocumentationRoutes';
import { routeHref } from '../navigation/Address';
import { getReferenceIcon } from '../navigation/TopicIcons';
import { FoundationPreview } from '../previews/FoundationPreview';
import { MetadataBadges, TemplateContent } from '../template/TemplateContent';
import type { Reference } from '../Reference';
import { Catalogue } from './Catalogue';
import { Documentation } from './Documentation';
import { Benchmark } from './Benchmark';

/**
 * A component's page on the Site: what it looks like and when to use it, in live figures with the
 * code under each, and a link to its page in the Docs, where its props, part names and changelog
 * are.
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
              <Button
                variant="secondary"
                size="sm"
                href={routeHref(apiRoute(document.id))}
                startIcon={<Api />}
                className="docs-api-link"
              >
                API
              </Button>
            </MetadataBadges>
          )
        }
      />
      <TemplateContent document={document} />
    </>
  );
}

/** A pattern's page: every section of the template, in the page's order. */
export function PatternPage({ page }: { page: SitePage }) {
  const document = page.document!;
  return (
    <>
      <PageHeader
        title={page.title}
        breadcrumb={page.group ? `Patterns / ${page.group}` : 'Patterns'}
        description={page.summary}
        meta={document.metadata && <MetadataBadges metadata={document.metadata} />}
      />
      <TemplateContent document={document} />
    </>
  );
}

/**
 * The tokens each foundation's page names in a sentence: the custom properties, as Markdown, of
 * what the page shows. A foundation without tokens of its own names none.
 */
const foundationTokens: Record<string, string> = {
  colors:
    'The colors are the `--env-color-*` tokens: roles such as `--env-color-bg-page` and `--env-color-fg-muted`, each with a value in every theme.',
  typography:
    'Type takes the `--env-type-*` and `--env-font-*` tokens, such as `--env-type-body` and `--env-font-weight-medium`.',
  spacing:
    'Space and corners take the `--env-space-*` and `--env-radius-*` tokens, such as `--env-space-4` and `--env-radius-surface`.',
  scale:
    'Sizes that follow the scale are tokens, such as `--env-control-height-md`, `--env-row-height` and `--env-icon-size-md`, with a comfortable and a compact value.',
  responsive:
    'The stacking order takes the `--env-z-*` tokens, such as `--env-z-sticky` and `--env-z-popover`.',
  icons: 'Icons take their size from the `--env-icon-*` tokens and their color from the text.',
  accessibility:
    'Motion takes the `--env-motion-*` tokens, and an unavailable control `--env-state-disabled-opacity`.',
};

/**
 * A foundation's page on the Site: a short introduction, its visuals, the tokens it uses in a
 * sentence and a link to its guide in the Docs, where the written guidance is.
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
      <Column gap={4} className="docs-article docs-foundation-notes">
        {tokens && <Documentation markdown={tokens} path={reference.path} />}
        <Text>
          <Link href={routeHref(foundationGuideRoute(reference.id))}>
            Read the {page.title.toLowerCase()} guide in the Docs
          </Link>
        </Text>
      </Column>
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
