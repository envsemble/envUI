import { Fragment, Suspense, useRef, type RefObject } from 'react';
import type { TableOfContentsItem } from '@envsemble/envui';
import type { DocumentationEntry } from '../../documentation/DocumentationTypes';
import { markdownHeadings, PageMarkdown } from '../../markdown/PageMarkdown';
import { StageSkeleton } from '../../loading/Skeletons';
import { useFoundationFigures } from '../../figures/foundations/FoundationFigures';
import { useSubjectShown } from '../../figures/useSubjectShown';
import { FigurePart } from '../../figures/foundations/FoundationFrame';

const figureFence = /^```tsx figure=([A-Za-z]\w*)\n\n?```[ \t]*$/m;

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

const guidePieces = (document: DocumentationEntry) =>
  (document.markdown ?? '').split(new RegExp(figureFence.source, 'gm'));

const isFigureName = (pieceIndex: number) => pieceIndex % 2 === 1;

export const guideContents = (document: DocumentationEntry): TableOfContentsItem[] =>
  guidePieces(document)
    .filter((_, index) => !isFigureName(index))
    .flatMap((piece) => markdownHeadings(piece))
    .filter(({ level }) => level === 2)
    .map(({ id, text }) => ({ id, label: text }));

export function GuideDocument({ document }: { document: DocumentationEntry }) {
  const pieces = guidePieces(document);
  if (pieces.length === 1) return <PageMarkdown document={document} />;
  return pieces.map((piece, index) => (
    <Fragment key={index}>
      {isFigureName(index) ? (
        <Suspense fallback={guideFigureSkeleton(document.id, piece)}>
          <GuideFigure page={document.id} name={piece} />
        </Suspense>
      ) : (
        piece.trim() && <PageMarkdown markdown={piece} path={document.path} />
      )}
    </Fragment>
  ));
}
