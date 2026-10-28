import { Link, Text } from '@envsemble/envui';
import { routeHref } from '../../navigation/Address';
import { foundations } from './Foundations';
import { miniatures } from './Miniatures';

/**
 * Proposal A: the foundations as the components and patterns are shown, a gallery of tiles, each
 * a small picture of the foundation's values on the recessed canvas with its name under it.
 */
export function DesignGallery() {
  return (
    <ul className="catalogue-gallery-grid catalogue-foundations-gallery">
      {foundations.map((foundation) => {
        const Miniature = miniatures[foundation.id]!;
        return (
          <li key={foundation.id} className="catalogue-gallery-tile">
            <div className="catalogue-related-stage catalogue-gallery-stage catalogue-foundations-tile">
              <Miniature />
            </div>
            <Text
              render={<h2 />}
              variant="body-sm"
              emphasis="muted"
              className="catalogue-gallery-name"
            >
              <Link
                href={routeHref(foundation.path)}
                underline={false}
                className="catalogue-gallery-link"
              >
                {foundation.title}
              </Link>
            </Text>
          </li>
        );
      })}
    </ul>
  );
}
