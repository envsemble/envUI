import { Component, useState, type ErrorInfo, type ReactNode } from 'react';
import { Button, EmptyState, Stack, Text } from '@envsemble/envui';

/**
 * Catches a page that fails to render and shows a danger EmptyState in its place, so the frame
 * around it keeps working. Wrap the router's outlet inside AppShell.Main with it, keyed by the
 * path, so going to another page starts again.
 */
class PageErrorBoundary extends Component<
  { children: ReactNode; onRetry?: () => void },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    // Send the error to your error reporting here, with info.componentStack.
    void error;
    void info;
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <EmptyState
        tone="danger"
        headingLevel={2}
        title="This page couldn’t load"
        description="Something went wrong while showing it. Nothing you saved is lost."
        action={
          <Button
            variant="secondary"
            onClick={() => {
              this.props.onRetry?.();
              this.setState({ failed: false });
            }}
          >
            Try again
          </Button>
        }
      />
    );
  }
}

/** Stands in for a page of the application; it fails to render once asked to. */
function Report({ broken }: { broken: boolean }) {
  if (broken) throw new Error('The report could not be read.');
  return <Text>Quarterly report: 12 tasks done, 3 to go.</Text>;
}

export default function ErrorBoundary() {
  const [broken, setBroken] = useState(false);
  return (
    <Stack gap={4} align="start">
      <Button variant="secondary" onClick={() => setBroken(true)}>
        Break the page
      </Button>
      <PageErrorBoundary onRetry={() => setBroken(false)}>
        <Report broken={broken} />
      </PageErrorBoundary>
    </Stack>
  );
}
