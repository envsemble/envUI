import { PageMarkdown } from './PageMarkdown';
import { optionPieces } from '../documentation/CatalogueContent';
import { OptionLegend } from './OptionLegend';
import { useSectionOutline } from './SectionOutline';

export function MarkdownWithLegends({ markdown, path }: { markdown: string; path: string }) {
  const pieces = optionPieces(markdown);
  const outline = useSectionOutline();
  if (pieces.length === 1 && 'markdown' in pieces[0])
    return <PageMarkdown markdown={markdown} path={path} />;
  return (
    <>
      {pieces.map((piece, index) =>
        'options' in piece
          ? !outline && <OptionLegend key={index} table={piece.options} path={path} />
          : piece.markdown.trim() && (
              <PageMarkdown key={index} markdown={piece.markdown} path={path} />
            ),
      )}
    </>
  );
}
