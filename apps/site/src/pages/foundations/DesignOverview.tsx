import { Link, Text } from '@envsemble/envui';
import { routeHref } from '../../navigation/Address';
import { foundations } from './Foundations';
import { miniatures } from './Miniatures';

/**
 * Proposal B: an overview to read down, one row for each foundation: its name, what it covers and
 * the topics its page opens with, beside a figure of its values, named.
 */
export function DesignOverview() {
  return (
    <div className="catalogue-foundations-rows">
      {foundations.map((foundation) => {
        const Miniature = miniatures[foundation.id]!;
        const href = routeHref(foundation.path);
        return (
          <section
            key={foundation.id}
            aria-labelledby={`foundation-${foundation.id}`}
            className="catalogue-foundations-row"
          >
            <div className="catalogue-foundations-row-text">
              <Text render={<h2 id={`foundation-${foundation.id}`} />} variant="title">
                <Link href={href} underline={false} className="catalogue-foundations-row-link">
                  {foundation.title}
                </Link>
              </Text>
              <Text render={<p />} emphasis="muted" className="catalogue-supporting">
                {foundation.summary}
              </Text>
              <ul className="catalogue-foundations-topics" aria-label={`On ${foundation.title}`}>
                {foundation.topics.map((topic) => (
                  <li key={topic.id}>
                    <Link
                      href={routeHref(
                        `${foundation.path}?${new URLSearchParams({ section: topic.id })}`,
                      )}
                      underline={false}
                    >
                      {topic.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div
              className="site-foundation-stage catalogue-foundations-figure"
              data-figure="example"
            >
              <Miniature named />
            </div>
          </section>
        );
      })}
    </div>
  );
}
