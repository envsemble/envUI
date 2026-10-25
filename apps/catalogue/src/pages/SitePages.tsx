import { Column } from '@envsemble/envui';
import { Widgets } from '@envsemble/envui/icons/Widgets';
import { Pattern } from '@envsemble/envui/icons/Pattern';
import { PageHeader } from '../layout/PageHeader';
import type { RoutePage } from '../navigation/DocumentationRoutes';
import { OtherPartButton } from '../navigation/OtherPart';
import { getPatternIcon, getReferenceIcon } from '../navigation/TopicIcons';
import { FoundationPreview } from '../previews/FoundationPreview';
import { MetadataBadges, TemplateContent } from '../template/TemplateContent';
import type { Reference } from '../Reference';
import { Catalogue } from './Catalogue';
import { PatternCatalogue } from './PatternCatalogue';
import { Documentation } from './Documentation';

/**
 * A component's page in the Usage guide: what it looks like and when to use it, in live figures
 * with the code under each, and a link to its page in the Docs, its guide to using it in code with
 * its props, part names and changelog.
 */
export function ComponentPage({ page }: { page: RoutePage }) {
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
  const Icon = getPatternIcon(document.id);
  return (
    <>
      <PageHeader
        title={page.title}
        breadcrumb={page.group ? `Patterns / ${page.group}` : 'Patterns'}
        description={page.summary}
        // eslint-disable-next-line react-hooks/static-components
        symbol={<Icon />}
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
 * A foundation's page in the Usage guide: how envUI handles its subject, in pictures and plain
 * words. Its page in the Docs, which Docs opens, holds the tokens and code behind them.
 */
export function FoundationPage({ page }: { page: RoutePage }) {
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
        meta={<OtherPartButton page={page} />}
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
export function ComponentsPage({ page }: { page: RoutePage }) {
  return (
    <>
      <PageHeader title={page.title} description={page.summary} symbol={<Widgets />} />
      <Column gap={7} className="docs-article docs-overview">
        <Catalogue />
      </Column>
    </>
  );
}

/** Every pattern, by what people are doing. */
export function PatternsPage({ page }: { page: RoutePage }) {
  return (
    <>
      <PageHeader title={page.title} description={page.summary} symbol={<Pattern />} />
      <Column gap={7} className="docs-article docs-overview">
        <PatternCatalogue />
      </Column>
    </>
  );
}
