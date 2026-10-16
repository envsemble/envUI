import { Component, type ReactNode } from 'react';
import { ActionGroup, Alert, Button } from '@envsemble/envui';

interface LoadBoundaryProps {
  /** What failed to load, for the message: an example, its code or a specimen. */
  what: string;
  /** Loads it again: drops what failed, so the next render fetches it anew. */
  onRetry: () => void;
  children: ReactNode;
}

/**
 * Keeps a part of a page that loads on its own, such as an example, from taking the page down when
 * its file fails to load: after a new deploy the old file may be gone. It says so in place, with
 * a retry and a reload of the page, which fetches the current files.
 */
export class LoadBoundary extends Component<LoadBoundaryProps, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  retry = () => {
    this.props.onRetry();
    this.setState({ failed: false });
  };

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <Alert
        tone="warning"
        title={`The ${this.props.what} could not load`}
        action={
          <ActionGroup>
            <Button variant="secondary" onClick={this.retry}>
              Try again
            </Button>
            <Button variant="text" onClick={() => window.location.reload()}>
              Reload the page
            </Button>
          </ActionGroup>
        }
      >
        The catalogue may have been updated since this page opened, or the connection dropped.
      </Alert>
    );
  }
}
