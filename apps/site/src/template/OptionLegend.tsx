import { Documentation } from '../pages/Documentation';
import { optionPieces, type OptionTable } from '../shared/CatalogueContent';
import { useSectionOutline } from './SectionOutline';

/**
 * An option table as the catalogue shows it: a legend, laid out as an anatomy figure's legend is,
 * each option's name followed by what it is for, and
 * below that any detail the table adds, such as the tones a variant takes. The Markdown keeps the
 * table, which the packaged page and agents read; its first column names the options, its last, Use
 * for, says what each is for (apps/site/src/shared/CatalogueContent.ts).
 */
export function OptionLegend({ table, path }: { table: OptionTable; path: string }) {
  return (
    <dl className="catalogue-option-legend" aria-label={table.column}>
      {table.options.map((option) => (
        <div key={option.name} className="catalogue-option">
          <dt>{option.name}</dt>
          <dd>
            <Documentation markdown={option.use} path={path} />
            {option.details.map(
              (detail) =>
                detail.markdown && (
                  <div key={detail.title} className="catalogue-option-detail">
                    <Documentation markdown={`${detail.title}: ${detail.markdown}`} path={path} />
                  </div>
                ),
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** Markdown with its option tables shown as legends, and the rest as it is written. */
export function SiteMarkdown({ markdown, path }: { markdown: string; path: string }) {
  const pieces = optionPieces(markdown);
  // A section waiting its turn to show renders its headings alone (SectionOutline).
  const outline = useSectionOutline();
  if (pieces.length === 1 && 'markdown' in pieces[0])
    return <Documentation markdown={markdown} path={path} />;
  return (
    <>
      {pieces.map((piece, index) =>
        'options' in piece
          ? !outline && <OptionLegend key={index} table={piece.options} path={path} />
          : piece.markdown.trim() && (
              <Documentation key={index} markdown={piece.markdown} path={path} />
            ),
      )}
    </>
  );
}
