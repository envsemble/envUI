import { Alert, Link, type TableOfContentsItem } from '@envsemble/envui';
import type { DocumentationEntry } from '../../documentation/DocumentationTypes';
import { SiteBanner } from '../../frame/SiteBanner';
import { catalogueTrail } from '../../routes/Trails';
import type { DocumentPage, RoutePage } from '../../routes/SiteRoutes';
import { TemplateContent, templateContents } from '../../template/TemplateContent';
import { useDocument } from '../PageContent';

export function ComponentPage({ page }: { page: DocumentPage }) {
  const document = useDocument(page.document);
  return (
    <>
      <SiteBanner
        page={page}
        title={page.title}
        trail={catalogueTrail(page)}
        description={page.summary}
      />
      <TemplateContent document={document} overviewHeading={false} />
    </>
  );
}

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

export function FoundationPage({ page }: { page: DocumentPage }) {
  const document = useDocument(page.document);
  return (
    <>
      <SiteBanner
        page={page}
        title={page.title}
        trail={catalogueTrail(page)}
        description={page.summary}
      />
      {document.id === 'icons' && <IconsCredit />}
      <TemplateContent document={document} related={false} />
    </>
  );
}

export function catalogueContents(
  page: RoutePage,
  document: DocumentationEntry | undefined,
): TableOfContentsItem[] {
  if (!document) return [];
  return templateContents(document, { related: page.kind !== 'foundation' });
}
