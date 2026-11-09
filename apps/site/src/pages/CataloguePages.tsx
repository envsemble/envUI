import { Alert, Link } from '@envsemble/envui';
import { SiteBanner } from '../banner/SiteBanner';
import { catalogueTrail } from '../routes/Trails';
import type { DocumentPage } from '../routes/SiteRoutes';
import { PartSwitch } from '../routes/OtherPart';
import { TemplateContent } from '../template/TemplateContent';
import { MetadataBadges } from '../template/MetadataBadges';
import { useDocument } from './PageContent';

/**
 * A component's page in the catalogue: what it looks like and when to use it, in live figures
 * with the code under each, and a link to its page in the Docs, its guide to using it in code with
 * its props, part names and changelog.
 */
export function ComponentPage({ page }: { page: DocumentPage }) {
  const document = useDocument(page.document);
  return (
    <>
      <SiteBanner
        title={page.title}
        trail={catalogueTrail(page)}
        description={page.summary}
        subject={document.id}
        meta={document.metadata && <MetadataBadges metadata={document.metadata} plain />}
        corner={<PartSwitch page={page} />}
      />
      <TemplateContent document={document} overviewHeading={false} />
    </>
  );
}

/**
 * A pattern's page: every section of the template, in the page's order, and a link to its guide in
 * the Docs.
 */
export function PatternPage({ page }: { page: DocumentPage }) {
  const document = useDocument(page.document);
  return (
    <>
      <SiteBanner
        title={page.title}
        trail={catalogueTrail(page)}
        description={page.summary}
        subject={document.id}
        meta={document.metadata && <MetadataBadges metadata={document.metadata} plain />}
        corner={<PartSwitch page={page} />}
      />
      <TemplateContent document={document} overviewHeading={false} />
    </>
  );
}

/**
 * The credit for the icons, at the top of the Icons page, on this page alone: envUI draws no icons
 * of its own, and uses Material Design's, under their license. The package carries the license and
 * its notice (packages/ui/THIRD_PARTY_NOTICES.md).
 */
function IconsCredit() {
  return (
    <div className="site-article catalogue-icons-credit">
      <Alert title="The icons are Material Design's">
        envUI doesn't draw icons of its own: it uses{' '}
        <Link href="https://m3.material.io/styles/icons">Material Symbols</Link>, from Material
        Design, in their Rounded style. They are free to use under the{' '}
        <Link href="https://www.apache.org/licenses/LICENSE-2.0">Apache License 2.0</Link>, and the
        package includes the license.
      </Alert>
    </div>
  );
}

/**
 * A foundation's page in the catalogue: how envUI handles its subject, in pictures and plain
 * words. Its page in the Docs, which Docs opens, holds the tokens and code behind them.
 */
export function FoundationPage({ page }: { page: DocumentPage }) {
  const document = useDocument(page.document);
  return (
    <>
      <SiteBanner
        title={page.title}
        trail={catalogueTrail(page)}
        description={page.summary}
        subject={document.id}
        corner={<PartSwitch page={page} />}
      />
      {document.id === 'icons' && <IconsCredit />}
      {/* A foundation is its Markdown, with its figures in place. */}
      <TemplateContent document={document} related={false} />
    </>
  );
}
