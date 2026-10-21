import { useState } from 'react';
import { Button, EmptyState, Page, Row } from '@envsemble/envui';
import { Code } from '@envsemble/envui/content';
import { Home } from '@envsemble/envui/icons/Home';
import { SearchOff } from '@envsemble/envui/icons/SearchOff';

/**
 * The page for an address the application has no page for, inside the app frame, so people keep
 * its navigation. Render it from the router's catch-all route, with the path people asked for.
 */
export default function NotFoundPage() {
  // The path people asked for, from the router's location.
  const [path] = useState(requestedPath);
  return (
    <Page width="md">
      <EmptyState
        align="center"
        headingLevel={1}
        icon={<SearchOff />}
        title="Page not found"
        description={
          <>
            There’s no page at <Code>{path}</Code>. Check the address, or go to the home page. If
            you followed a link in Northwind, the page may have moved or been deleted.
          </>
        }
        action={
          <Row wrap justify="center" gap={3}>
            <Button href="/" startIcon={<Home />}>
              Go to home
            </Button>
            {/* Only where the application has a search page: it opens with the last part of the
                address as the query. Without one, set searchPath to null and leave Search out. */}
            {searchPath && (
              <Button
                variant="secondary"
                href={`${searchPath}?${new URLSearchParams({ q: queryOf(path) })}`}
              >
                Search
              </Button>
            )}
          </Row>
        }
      />
    </Page>
  );
}

/** The last part of a path, in words: /projects/website-redesign is "website redesign". */
function queryOf(path: string) {
  return (path.split('/').filter(Boolean).pop() ?? '').replaceAll('-', ' ');
}

const requestedPath = '/projects/website-redesign';
/** The application's search page, or null where it has none. */
const searchPath: string | null = '/search';
