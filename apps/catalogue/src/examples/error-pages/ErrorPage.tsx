import { useEffect, useRef } from 'react';
import { Button, Column, EmptyState, Page, Scaffold, Text } from '@envsemble/envui';
import { Code } from '@envsemble/envui/content';
import { Refresh } from '@envsemble/envui/icons/Refresh';
import { Warning } from '@envsemble/envui/icons/Warning';

/**
 * The screen for an application that failed to load, a whole screen of its own, since the frame
 * may be what failed. Render it from the error boundary at the application's root, with the
 * reference your error reporting gave the failure.
 */
export default function ErrorPage() {
  const main = useRef<HTMLElement>(null);
  // It replaces the application, so focus moves to the body, which screen readers then read from.
  useEffect(() => {
    main.current?.focus({ preventScroll: true });
  }, []);
  return (
    // A Scaffold with only a body: the main landmark, which fills the window and scrolls.
    <Scaffold bodyRef={main}>
      {/* The column fills the body and centres the message in it. */}
      <Column justify="center" style={{ minBlockSize: '100%', paddingBlock: 'var(--env-space-7)' }}>
        <Page width="sm">
          <EmptyState
            align="center"
            headingLevel={1}
            tone="danger"
            icon={<Warning />}
            title="Something went wrong"
            description="Northwind couldn’t load. Nothing you saved is lost. Try again, and if it keeps happening, contact support and quote the reference."
            action={
              <Column align="center" gap={4}>
                <Button startIcon={<Refresh />} onClick={() => window.location.reload()}>
                  Try again
                </Button>
                <Text variant="body-sm" emphasis="muted">
                  Reference <Code>{reference}</Code>
                </Text>
              </Column>
            }
          />
        </Page>
      </Column>
    </Scaffold>
  );
}

/** The identifier your error reporting gave the failure, for people to quote to support. */
const reference = 'NW-7F3A-2C91';
