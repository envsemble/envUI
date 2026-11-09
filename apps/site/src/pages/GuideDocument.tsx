import { Fragment, Suspense, useRef, type RefObject } from 'react';
import type { TableOfContentsItem } from '@envsemble/envui';
import type { DocumentationEntry } from '@docs-model/DocumentationTypes';
import { markdownHeadings, PageMarkdown } from '../markdown/PageMarkdown';
import { StageSkeleton } from '../loading/Skeletons';
import { useFoundationFigures } from '../figures/foundations/FoundationFigures';
import { useSubjectShown } from '../figures/useSubjectShown';
import { FigurePart } from '../figures/foundations/FoundationFrame';

/**
 * A guide's figure: an empty ```tsx figure=Name``` fence, which the package leaves out. The guide's
 * figures are registered for its page in FoundationFigures.ts and load with the first that shows.
 */
const figureFence = /^```tsx figure=([A-Za-z]\w*)\n\n?```[ \t]*$/m;

/** A guide's figure while it loads, and on a pre-rendered page until it renders (useSubjectShown). */
const guideFigureSkeleton = (
  page: string,
  name: string,
  place?: RefObject<HTMLDivElement | null>,
) => <StageSkeleton ref={place} part={`figure:${page}/${name}`} what="figures" stage />;

function GuideFigure({ page, name }: { page: string; name: string }) {
  const figure = useFoundationFigures(page)?.[name];
  const place = useRef<HTMLDivElement>(null);
  const shown = useSubjectShown(place);
  if (!figure)
    throw new Error(`docs/${page}.md places ${name}, which FoundationFigures.ts doesn't register`);
  if (!shown) return guideFigureSkeleton(page, name, place);
  const Render = figure.render;
  return (
    <FigurePart value={`figure:${page}/${name}`}>
      <Render legend={[]} />
    </FigurePart>
  );
}

/** A guide's Markdown and the names of its figures, by turns: the split keeps each figure's name. */
const guidePieces = (document: DocumentationEntry) =>
  (document.markdown ?? '').split(new RegExp(figureFence.source, 'gm'));

/** The sections of a guide (GuideDocument): the h2 headings of each piece of its Markdown. */
export const guideContents = (document: DocumentationEntry): TableOfContentsItem[] =>
  guidePieces(document)
    .filter((_, index) => index % 2 === 0)
    .flatMap((piece) => markdownHeadings(piece))
    .filter(({ level }) => level === 2)
    .map(({ id, text }) => ({ id, label: text }));

/** A guide page's Markdown, with its figures in place. */
export function GuideDocument({ document }: { document: DocumentationEntry }) {
  const pieces = guidePieces(document);
  if (pieces.length === 1) return <PageMarkdown document={document} />;
  // Markdown and figure names alternate: the split keeps each figure's name.
  return pieces.map((piece, index) => (
    <Fragment key={index}>
      {index % 2 ? (
        <Suspense fallback={guideFigureSkeleton(document.id, piece)}>
          <GuideFigure page={document.id} name={piece} />
        </Suspense>
      ) : (
        piece.trim() && <PageMarkdown markdown={piece} path={document.path} />
      )}
    </Fragment>
  ));
}
