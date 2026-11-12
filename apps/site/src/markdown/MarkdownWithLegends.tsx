import { PageMarkdown } from './PageMarkdown';
import { optionPieces } from '../documentation/CatalogueContent';
import { OptionLegend } from './OptionLegend';
import { useSectionOutline } from './SectionOutline';

/**
 * PageMarkdown with its option tables shown as legends (OptionLegend), and the rest as it is
 * written: the Markdown between a section's figures (FigureSection).
 */
export function MarkdownWithLegends({ markdown, path }: { markdown: string; path: string }) {
  const pieces = optionPieces(markdown);
  // A section waiting its turn to show renders its headings alone (SectionOutline).
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
