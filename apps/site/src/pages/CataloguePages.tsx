import { Column } from '@envsemble/envui';
import { PageHeader } from '../layout/PageHeader';
import { catalogueTrail } from '../navigation/CatalogueTrail';
import type { RoutePage } from '../navigation/SiteRoutes';
import { OtherPartButton } from '../navigation/OtherPart';
import { MetadataBadges, TemplateContent } from '../template/TemplateContent';
import { Catalogue } from './Catalogue';
import { FoundationCatalogue } from './FoundationCatalogue';
import { PatternCatalogue } from './PatternCatalogue';
import { Documentation } from './Documentation';

/**
 * A component's page in the catalogue: what it looks like and when to use it, in live figures
 * with the code under each, and a link to its page in the Docs, its guide to using it in code with
 * its props, part names and changelog.
 */
export function ComponentPage({ page }: { page: RoutePage }) {
  const document = page.document!;
  return (
    <>
      <PageHeader
        title={page.title}
        trail={catalogueTrail(page)}
        description={page.summary}
        subject={document.id}
        meta={
          document.metadata && (
            <MetadataBadges metadata={document.metadata} plain>
              <OtherPartButton page={page} />
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
export function PatternPage({ page }: { page: RoutePage }) {
  const document = page.document!;
  return (
    <>
      <PageHeader
        title={page.title}
        trail={catalogueTrail(page)}
        description={page.summary}
        subject={document.id}
        meta={
          document.metadata && (
            <MetadataBadges metadata={document.metadata} plain>
              <OtherPartButton page={page} />
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
 * A foundation's page in the catalogue: how envUI handles its subject, in pictures and plain
 * words. Its page in the Docs, which Docs opens, holds the tokens and code behind them.
 */
export function FoundationPage({ page }: { page: RoutePage }) {
  const document = page.document!;
  return (
    <>
      <PageHeader
        title={page.title}
        trail={catalogueTrail(page)}
        description={page.summary}
        subject={document.id}
        meta={<OtherPartButton page={page} />}
      />
      {/* A foundation is its Markdown, with its figures in place. */}
      <TemplateContent document={document} related={false} />
      {document.id === 'icons' && (
        <Column gap={4} className="site-article catalogue-foundation-notes catalogue-icons-credit">
          <Documentation markdown={iconsCredit} path={document.path} />
        </Column>
      )}
    </>
  );
}

/** Every foundation at a glance, each a way to its page. */
export function FoundationsPage({ page }: { page: RoutePage }) {
  return (
    <>
      <PageHeader
        title={page.title}
        trail={catalogueTrail(page)}
        description={page.summary}
        subject="foundations"
      />
      <Column gap={7} className="site-article catalogue-overview">
        <FoundationCatalogue />
      </Column>
    </>
  );
}

/** Every component, by what it is for. */
export function ComponentsPage({ page }: { page: RoutePage }) {
  return (
    <>
      <PageHeader
        title={page.title}
        trail={catalogueTrail(page)}
        description={page.summary}
        subject="components"
      />
      <Column gap={7} className="site-article catalogue-overview">
        <Catalogue />
      </Column>
    </>
  );
}

/** Every pattern, by what people are doing. */
export function PatternsPage({ page }: { page: RoutePage }) {
  return (
    <>
      <PageHeader
        title={page.title}
        trail={catalogueTrail(page)}
        description={page.summary}
        subject="patterns"
      />
      <Column gap={7} className="site-article catalogue-overview">
        <PatternCatalogue />
      </Column>
    </>
  );
}
