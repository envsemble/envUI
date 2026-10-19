import { Suspense, useState, type ReactNode } from 'react';
import { Card, EmptyState, Link, Stack, Surface, Text } from '@envsemble/envui';
import { ViewQuilt } from '@envsemble/envui/icons/ViewQuilt';
import { PageHeader } from '../layout/PageHeader';
import { Documentation } from './Documentation';
import { LoadBoundary, lazyPart } from '../template/LoadBoundary';
import { MetadataBadges, SingleViewContent } from '../template/TemplateContent';
import { guidePages, pagesOf, type StandalonePage } from '../navigation/DocumentationRoutes';
import { routeHref } from '../navigation/Address';

/** The token reference and the changelog, large pages that load with the page that shows them. */
const tokenReference = lazyPart(
  () => import('./TokenReference'),
  (module) => module.TokenReference,
  'src/pages/TokenReference.tsx',
);
const changelog = lazyPart(
  () => import('./Changelog'),
  (module) => module.Changelog,
  'src/pages/Changelog.tsx',
);

function LoadedPart({ part, what }: { part: typeof tokenReference; what: string }) {
  const [, setAttempt] = useState(0);
  const Part = part.component;
  return (
    <LoadBoundary
      what={what}
      modules={part.modules}
      onRetry={() => {
        part.retry();
        setAttempt((count) => count + 1);
      }}
    >
      <Suspense fallback={<Text role="status">Loading the {what}…</Text>}>
        <Part />
      </Suspense>
    </LoadBoundary>
  );
}

/** The Templates overview: a card per template page, saying where its screens render. */
function Templates() {
  const templates = pagesOf('Templates').flatMap((entry) => {
    const page = guidePages.find((item) => item.path === entry.path);
    return page?.document ? [{ ...page, document: page.document }] : [];
  });
  if (!templates.length)
    return (
      <Surface background="default" padding={0} className="docs-placeholder">
        <EmptyState
          align="center"
          headingLevel={2}
          icon={<ViewQuilt />}
          title="No templates yet"
          description="Templates are not published yet. Until then, the patterns and the examples on each component's page show how envUI composes."
        />
      </Surface>
    );
  return (
    <ul className="docs-template-gallery" aria-label="Templates">
      {templates.map(({ path, title, document }) => (
        <li key={path}>
          <Card
            actions={<Link href={routeHref(path)}>Open {title}</Link>}
            title={title}
            headingLevel={2}
            meta={document.metadata?.frame === 'app' ? 'Inside the app frame' : 'A whole screen'}
            description={document.summary}
            icon={<ViewQuilt />}
          />
        </li>
      ))}
    </ul>
  );
}

/**
 * A page with one view: a guide, pattern or template page of docs/, the token reference, the
 * templates overview or the changelog, under a banner with its title and section.
 */
export function StandalonePageContent({ page }: { page: StandalonePage }) {
  let content: ReactNode;
  const { document } = page;
  if (document?.sections) content = <SingleViewContent document={document} />;
  else if (document) content = <Documentation document={document} />;
  else if (page.path === 'foundations/tokens')
    content = <LoadedPart part={tokenReference} what="token reference" />;
  else if (page.path === 'changelog') content = <LoadedPart part={changelog} what="changelog" />;
  else content = <Templates />;
  // A pattern's section in the banner names its intent too.
  const breadcrumb = document?.metadata?.intent
    ? `${page.section} / ${document.metadata.intent}`
    : page.section;
  return (
    <>
      <PageHeader
        title={page.title}
        breadcrumb={breadcrumb}
        description={page.summary}
        meta={document?.metadata && <MetadataBadges metadata={document.metadata} />}
      />
      {document?.sections ? (
        content
      ) : (
        <Stack gap={7} className="docs-article">
          {content}
        </Stack>
      )}
    </>
  );
}
