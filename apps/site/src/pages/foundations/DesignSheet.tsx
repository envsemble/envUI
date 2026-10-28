import { Link, Text } from '@envsemble/envui';
import { ArrowForward } from '@envsemble/envui/icons/ArrowForward';
import { routeHref } from '../../navigation/Address';
import { foundations } from './Foundations';
import { miniatures } from './Miniatures';

/** The sheet opens with the type, across its top, then the rest in the catalogue's order. */
const sheetOrder = [
  ...foundations.filter((foundation) => foundation.id === 'typography'),
  ...foundations.filter((foundation) => foundation.id !== 'typography'),
];

/**
 * Proposal C: the system at a glance, one specimen sheet on the recessed canvas: type, color,
 * space and corners, icons, widths and the keyboard together, each part a way to its page. The
 * parts share one canvas and meet at hairlines, so the sheet reads as one picture of envUI.
 */
export function DesignSheet() {
  return (
    <div className="site-foundation-stage catalogue-foundations-sheet" data-figure="example">
      {sheetOrder.map((foundation) => {
        const Miniature = miniatures[foundation.id]!;
        return (
          <section
            key={foundation.id}
            aria-labelledby={`sheet-${foundation.id}`}
            className="catalogue-foundations-cell"
            data-foundation={foundation.id}
          >
            <Text
              render={<h2 id={`sheet-${foundation.id}`} />}
              variant="body-sm"
              className="catalogue-foundations-cell-name"
            >
              <Link
                href={routeHref(foundation.path)}
                underline={false}
                className="catalogue-foundations-cell-link"
              >
                {foundation.title}
              </Link>
              <ArrowForward aria-hidden="true" className="catalogue-foundations-cell-arrow" />
            </Text>
            <div className="catalogue-foundations-cell-picture">
              <Miniature named={foundation.id !== 'icons'} />
            </div>
          </section>
        );
      })}
    </div>
  );
}
