import { Fragment, Suspense } from 'react';
import type { Documentation as Document } from './PageModel';
import { Documentation } from './Documentation';
import { StageSkeleton } from '../loading/Skeletons';
import { useFoundationFigures } from '../figures/foundations/FoundationFigures';

/**
 * A guide's figure: an empty ```tsx figure=Name``` fence, which the package leaves out. The guide's
 * figures are registered for its page in FoundationFigures.ts and load with the first that shows.
 */
const figureFence = /^```tsx figure=([A-Za-z]\w*)\n\n?```[ \t]*$/m;

function GuideFigure({ page, name }: { page: string; name: string }) {
  const figure = useFoundationFigures(page)?.[name];
  if (!figure)
    throw new Error(`docs/${page}.md places ${name}, which FoundationFigures.ts doesn't register`);
  const Render = figure.render;
  return <Render legend={[]} />;
}

/** A guide page's Markdown, with its figures in place. */
export function GuideDocument({ document }: { document: Document }) {
  const pieces = (document.markdown ?? '').split(new RegExp(figureFence.source, 'gm'));
  if (pieces.length === 1) return <Documentation document={document} />;
  // Markdown and figure names alternate: the split keeps each figure's name.
  return pieces.map((piece, index) => (
    <Fragment key={index}>
      {index % 2 ? (
        <Suspense
          fallback={<StageSkeleton part={`figure:${document.id}/${piece}`} what="figures" stage />}
        >
          <GuideFigure page={document.id} name={piece} />
        </Suspense>
      ) : (
        piece.trim() && <Documentation markdown={piece} path={document.path} />
      )}
    </Fragment>
  ));
}
