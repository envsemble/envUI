import { Link, Row, Text } from '@envsemble/envui';
import { documentedVersion as version } from '../generated/Documentation';
import { routeHref } from '../navigation/Address';

/** The foot of every page: the version this catalogue documents, and where to go next. */
export function PageFooter() {
  return (
    <footer className="docs-footer">
      <Row wrap justify="between" align="center" gap={4}>
        <Text variant="caption">envUI {version}</Text>
        <Row render={<nav aria-label="Footer" />} wrap gap={5}>
          <Text variant="caption">
            <Link href={routeHref('changelog')}>Changelog</Link>
          </Text>
          <Text variant="caption">
            <Link href="https://github.com/envsemble/envUI">Source</Link>
          </Text>
          <Text variant="caption">
            <Link href="https://github.com/envsemble/envUI/issues">Report an issue</Link>
          </Text>
        </Row>
      </Row>
    </footer>
  );
}
