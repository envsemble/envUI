import { Link, Stack, Text } from '@envsemble/envui';
import { documentedVersion as version } from '../generated/Documentation';
import { routeHref } from '../navigation/Address';

/** The foot of every page: the version this catalogue documents, and where to go next. */
export function PageFooter() {
  return (
    <footer className="docs-footer">
      <Stack direction="row" wrap justify="between" align="center" gap={4}>
        <Text variant="caption">envUI {version} · Internal reference</Text>
        <Stack render={<nav aria-label="Footer" />} direction="row" wrap gap={5}>
          <Text variant="caption">
            <Link href={routeHref('changelog')}>Changelog</Link>
          </Text>
          <Text variant="caption">
            <Link href="https://github.com/envsemble/envUI">Source</Link>
          </Text>
          <Text variant="caption">
            <Link href="https://github.com/envsemble/envUI/issues">Report an issue</Link>
          </Text>
        </Stack>
      </Stack>
    </footer>
  );
}
