import { Button, Column } from '@envsemble/envui';
import { Api } from '@envsemble/envui/icons/Api';
import { MenuBook } from '@envsemble/envui/icons/MenuBook';
import { PageHeader } from '../layout/PageHeader';
import {
  apiRoute,
  foundationGuideRoute,
  patternGuideRoute,
  type SitePage,
} from '../navigation/DocumentationRoutes';
import { routeHref } from '../navigation/Address';
import { getReferenceIcon } from '../navigation/TopicIcons';
import { FoundationPreview } from '../previews/FoundationPreview';
import { MetadataBadges, TemplateContent } from '../template/TemplateContent';
import type { Reference } from '../Reference';
import { Catalogue } from './Catalogue';
import { PatternCatalogue } from './PatternCatalogue';
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
 * The link from a foundation's page on the Site to its guide in the Docs: the tokens, values and code
 * behind its plain words.
 */
export function GuideLink({ path }: { path: string }) {
  return (
    <Button
      variant="secondary"
      size="sm"
      href={routeHref(path)}
      startIcon={<MenuBook />}
      className="docs-guide-link"
    >
      Guide
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
            <MetadataBadges metadata={document.metadata} plain>
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
            <MetadataBadges metadata={document.metadata} plain>
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
 * The credit for the icons, under the Icons page's list: where they come from and their license,
 * linked. It is on this page alone. The package carries the license and its notice
 * (packages/ui/THIRD_PARTY_NOTICES.md).
 */
const iconsCredit = [
  '## Where the icons come from',
  '',
  "envUI's icons are [Material Symbols](https://m3.material.io/styles/icons), from Material Design, in their Rounded style. They are free to use under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0), and the package includes the license.",
].join('\n');

/**
 * A foundation's page on the Site: how envUI handles its subject, in pictures and plain words. Its
 * guide in the Docs, which Guide opens, holds the tokens and code behind them.
 */
export function FoundationPage({ page }: { page: SitePage }) {
  const reference = page.document as Reference;
  const Icon = getReferenceIcon(reference.id, reference.group);
  return (
    <>
      <PageHeader
        title={page.title}
        breadcrumb="Foundations"
        description={page.summary}
        // eslint-disable-next-line react-hooks/static-components
        symbol={<Icon />}
        meta={<GuideLink path={foundationGuideRoute(reference.id)} />}
      />
      <FoundationPreview id={reference.id} />
      {reference.id === 'icons' && (
        <Column gap={4} className="docs-article docs-foundation-notes docs-icons-credit">
          <Documentation markdown={iconsCredit} path={reference.path} />
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

/** Every pattern, by what people are doing. */
export function PatternsPage({ page }: { page: SitePage }) {
  return (
    <>
      <PageHeader title={page.title} breadcrumb="Patterns" description={page.summary} />
      <Column gap={7} className="docs-article docs-overview">
        <PatternCatalogue />
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
      <PageHeader title={page.title} breadcrumb="Overview" description={page.summary} />
      <Benchmark />
    </>
  );
}
