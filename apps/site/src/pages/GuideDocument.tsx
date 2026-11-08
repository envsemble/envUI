import { Fragment, Suspense, useState } from 'react';
import type { Documentation as Document } from './PageModel';
import { LoadBoundary, lazyPart } from '../loading/LoadBoundary';
import { Documentation } from './Documentation';
import { StageSkeleton } from '../loading/Loading';

/**
 * The live demos a guide page places with a `<!-- demo: Name -->` line, each loaded with the page
 * that shows it. The dev mode demo loads `@envsemble/envui/dev`, which no other page loads:
 * scripts/site/SiteDevMode.ts checks the hosted build for it.
 */
const demos = {
  DevModeDemo: lazyPart(
    () => import('../figures/dev-mode/DevModeDemo'),
    (module) => module.DevModeDemo,
    'src/figures/dev-mode/DevModeDemo.tsx',
  ),
  // The guide's pictures of dev mode at work, which load none of it.
  DevModeButtonPicture: lazyPart(
    () => import('../figures/dev-mode/DevModePictures'),
    (module) => module.DevModeButtonPicture,
    'src/figures/dev-mode/DevModePictures.tsx',
  ),
  DevModeWholePicture: lazyPart(
    () => import('../figures/dev-mode/DevModePictures'),
    (module) => module.DevModeWholePicture,
    'src/figures/dev-mode/DevModePictures.tsx',
  ),
  DevModeToolbarPicture: lazyPart(
    () => import('../figures/dev-mode/DevModePictures'),
    (module) => module.DevModeToolbarPicture,
    'src/figures/dev-mode/DevModePictures.tsx',
  ),
  DevModeSpacingPicture: lazyPart(
    () => import('../figures/dev-mode/DevModePictures'),
    (module) => module.DevModeSpacingPicture,
    'src/figures/dev-mode/DevModePictures.tsx',
  ),
  DevModeFramePicture: lazyPart(
    () => import('../figures/dev-mode/DevModePictures'),
    (module) => module.DevModeFramePicture,
    'src/figures/dev-mode/DevModePictures.tsx',
  ),
  DevModeInspectorPicture: lazyPart(
    () => import('../figures/dev-mode/DevModePictures'),
    (module) => module.DevModeInspectorPicture,
    'src/figures/dev-mode/DevModePictures.tsx',
  ),
  DevModeProblemsPicture: lazyPart(
    () => import('../figures/dev-mode/DevModePictures'),
    (module) => module.DevModeProblemsPicture,
    'src/figures/dev-mode/DevModePictures.tsx',
  ),
};

/** A `<!-- demo: Name -->` line; the packaged page keeps it as a comment, which shows nothing. */
const demoLine = /^<!--\s*demo:\s*([A-Za-z]\w*)\s*-->[ \t]*$/m;

function Demo({ name }: { name: string }) {
  const [, setAttempt] = useState(0);
  const part = demos[name as keyof typeof demos];
  if (!part) throw new Error(`No demo ${name} in apps/site/src/pages/GuideDocument.tsx`);
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
      <Suspense fallback={<StageSkeleton part={`demo:${name}`} what="demos" stage />}>
        <Part />
      </Suspense>
    </LoadBoundary>
  );
}

/** A guide page's Markdown, with its live demos in place. */
export function GuideDocument({ document }: { document: Document }) {
  const pieces = (document.markdown ?? '').split(new RegExp(demoLine.source, 'gm'));
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
