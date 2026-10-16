import { Suspense, useState, type ReactNode } from 'react';
import { EmptyState, Stack, Surface, Text } from '@envsemble/envui';
import { ViewQuilt } from '@envsemble/envui/icons/ViewQuilt';
import { PageHeader } from '../layout/PageHeader';
import { Documentation } from './Documentation';
import { LoadBoundary, lazyPart } from '../template/LoadBoundary';
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

function Templates() {
  return (
    <Surface tone="pane" padding={0} className="docs-placeholder">
      <EmptyState
        align="center"
        headingLevel={2}
        icon={<ViewQuilt />}
        title="No templates yet"
        description="Templates are not published yet. Until then, the patterns and the examples on each component's page show how envUI composes."
      />
    </Surface>
  );
}

/**
 * A page with one view: a guide or pattern of docs/, the token reference, the templates or the
 * changelog, under a banner with its title and section.
 */
export function StandalonePageContent({ page }: { page: StandalonePage }) {
  let content: ReactNode;
  if (page.document) content = <Documentation document={page.document} />;
  else if (page.path === 'foundations/tokens')
    content = <LoadedPart part={tokenReference} what="token reference" />;
  else if (page.path === 'changelog') content = <LoadedPart part={changelog} what="changelog" />;
  else content = <Templates />;
  return (
    <>
      <PageHeader title={page.title} breadcrumb={page.section} description={page.summary} />
      <Stack gap={7} className="docs-article">
        {content}
      </Stack>
    </>
  );
}
