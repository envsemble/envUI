import { Fragment, Suspense, useState } from 'react';
import type { Documentation as Document } from '../Reference';
import { LoadBoundary, lazyPart } from '../template/LoadBoundary';
import { Documentation } from './Documentation';
import { Loading } from '../template/Loading';

/**
 * The live demos a guide page places with a `<!-- demo: Name -->` line, each loaded with the page
 * that shows it. The dev mode demo loads `@envsemble/envui/dev`, which no other page loads:
 * scripts/SiteDevMode.mjs checks the hosted build for it.
 */
export const demos = {
  DevModeDemo: lazyPart(
    () => import('../demos/dev-mode/DevModeDemo'),
    (module) => module.DevModeDemo,
    'src/demos/dev-mode/DevModeDemo.tsx',
  ),
};

/** A `<!-- demo: Name -->` line; the packaged page keeps it as a comment, which shows nothing. */
export const demoLine = /^<!--\s*demo:\s*([A-Za-z]\w*)\s*-->[ \t]*$/m;

export function Demo({ name }: { name: string }) {
  const [, setAttempt] = useState(0);
  const part = demos[name as keyof typeof demos];
  if (!part) throw new Error(`No demo ${name} in apps/catalogue/src/pages/GuideDocument.tsx`);
  const Part = part.component;
  return (
    <LoadBoundary
      what="demo"
      modules={part.modules}
      onRetry={() => {
        part.retry();
        setAttempt((count) => count + 1);
      }}
    >
      <Suspense fallback={<Loading what="the demo" />}>
        <Part />
      </Suspense>
    </LoadBoundary>
  );
}

/** A guide page's Markdown, with its live demos in place. */
export function GuideDocument({ document }: { document: Document }) {
  const pieces = document.markdown.split(new RegExp(demoLine.source, 'gm'));
  if (pieces.length === 1) return <Documentation document={document} />;
  // Markdown and demo names alternate: the split keeps each demo's name.
  return pieces.map((piece, index) => (
    <Fragment key={index}>
      {index % 2 ? (
        <Demo name={piece} />
      ) : (
        piece.trim() && <Documentation markdown={piece} path={document.path} />
      )}
    </Fragment>
  ));
}
