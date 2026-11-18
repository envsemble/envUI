import { PageMarkdown } from './PageMarkdown';
import type { OptionTable } from '../documentation/CatalogueContent';

export function OptionLegend({ table, path }: { table: OptionTable; path: string }) {
  return (
    <dl className="catalogue-option-legend" aria-label={table.column}>
      {table.options.map((option) => (
        <div key={option.name} className="catalogue-option">
          <dt>{option.name}</dt>
          <dd>
            <PageMarkdown markdown={option.use} path={path} />
            {option.details.map(
              (detail) =>
                detail.markdown && (
                  <div key={detail.title} className="catalogue-option-detail">
                    <PageMarkdown markdown={`${detail.title}: ${detail.markdown}`} path={path} />
                  </div>
                ),
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
