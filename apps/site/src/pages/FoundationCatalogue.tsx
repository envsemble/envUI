import { Link, Text } from '@envsemble/envui';
import { IconArrowForward } from '@envsemble/envui/icons/ArrowForward';
import { routeHref } from '../navigation/Address';
import { pagesOf } from '../navigation/SiteRoutes';
import { glancePictures } from '../figures/foundations/Glance';

/** The foundations, the type first, across the sheet's top, then the rest in the catalogue's order. */
const foundations = pagesOf('catalogue')
  .filter((page) => page.kind === 'foundation' && page.document)
  .sort(
    (one, other) =>
      Number(other.document!.id === 'typography') - Number(one.document!.id === 'typography'),
  );

/**
 * Every foundation at a glance: one sheet on the recessed canvas, a pane for each foundation with
 * its name and a picture of its values, meeting the others at hairlines, so the sheet reads as one
 * picture of envUI. Each pane is one link to its page, the whole pane, named by its heading.
 */
export function FoundationCatalogue() {
  return (
    <div className="site-foundation-stage catalogue-foundation-sheet" data-figure="example">
      {foundations.map((page) => {
        const id = page.document!.id;
        const Picture = glancePictures[id]!;
        return (
          <Link
            key={id}
            href={routeHref(page.path)}
            underline={false}
            className="catalogue-foundation-pane"
            data-foundation={id}
          >
            <Text render={<h2 />} variant="body-sm" className="catalogue-foundation-pane-name">
              {page.title}
              <IconArrowForward aria-hidden="true" className="catalogue-foundation-pane-arrow" />
            </Text>
            <div className="catalogue-foundation-pane-picture">
              <Picture />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
