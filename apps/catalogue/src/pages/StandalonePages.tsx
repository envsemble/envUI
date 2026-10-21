import { Suspense, useState, type ReactNode } from 'react';
import { Column, Text } from '@envsemble/envui';
import { PageHeader } from '../layout/PageHeader';
import { Documentation } from './Documentation';
import { LoadBoundary, lazyPart } from '../template/LoadBoundary';
import { MetadataBadges, SingleViewContent } from '../template/TemplateContent';
import type { StandalonePage } from '../navigation/DocumentationRoutes';

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

/**
 * A page with one view: a guide or pattern page of docs/, the token reference or the changelog,
 * under a banner with its title and section.
 */
export function StandalonePageContent({ page }: { page: StandalonePage }) {
  let content: ReactNode;
  const { document } = page;
  if (document?.sections) content = <SingleViewContent document={document} />;
  else if (document) content = <Documentation document={document} />;
  else if (page.path === 'foundations/tokens')
    content = <LoadedPart part={tokenReference} what="token reference" />;
  else content = <LoadedPart part={changelog} what="changelog" />;
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
        <Column gap={7} className="docs-article">
          {content}
        </Column>
      )}
    </>
  );
}
