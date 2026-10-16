import { Component, createRef, type ReactNode } from 'react';
import { ActionGroup, Alert, Button } from '@envsemble/envui';

/** A file that a part of a page loads on its own and that failed to arrive. */
export class ModuleLoadError extends Error {
  constructor(cause: unknown) {
    super('A file of the catalogue failed to load', { cause });
    this.name = 'ModuleLoadError';
  }
}

/** A loader whose failure is a ModuleLoadError, which LoadBoundary shows in place. */
export function loadModule<T>(load: () => Promise<T>) {
  return () =>
    load().catch((error: unknown) => {
      throw new ModuleLoadError(error);
    });
}

/**
 * A loader that asks for a module again after it failed to load. A browser keeps a module that
 * failed as failed under its URL, so in development, where Vite serves each file at its own path,
 * the retry asks for the file at `path`, relative to `base`, under a new URL, with `query` (such as
 * `raw`) first. A build's chunks are asked for again as they are.
 */
export function reloadModule<T>(
  load: () => Promise<T>,
  path: string,
  base: string,
  { query, pick = (module) => module as T }: { query?: string; pick?: (module: unknown) => T } = {},
): () => Promise<T> {
  if (!import.meta.env.DEV) return load;
  const { pathname } = new URL(path, base);
  return () =>
    import(/* @vite-ignore */ `${pathname}?${query ? `${query}&` : ''}retry=${Date.now()}`).then(
      pick,
    );
}

interface LoadBoundaryProps {
  /** What failed to load, for the message: an example, its code or a specimen. */
  what: string;
  /** Loads it again: drops what failed, so the next render fetches it anew. */
  onRetry: () => void;
  children: ReactNode;
}

interface LoadBoundaryState {
  error: unknown;
  /** Whether people asked to load it again, which keeps a focusable wrapper around it. */
  retried: boolean;
}

/**
 * Keeps a part of a page that loads on its own, such as an example, from taking the page down when
 * its file fails to load: after a new deploy the old file may be gone. It says so in place, with
 * a retry and a reload of the page, which fetches the current files. Any other error, such as a
 * bug in an example, is not a failed load and goes on to the boundaries above.
 */
export class LoadBoundary extends Component<LoadBoundaryProps, LoadBoundaryState> {
  state: LoadBoundaryState = { error: undefined, retried: false };

  /** What focus goes to once Try again, which had it, is gone. */
  private wrapper = createRef<HTMLDivElement>();

  static getDerivedStateFromError(error: unknown) {
    return { error };
  }

  componentDidUpdate() {
    // After a retry, focus that the replaced content dropped returns here, whether the content
    // loads or fails again.
    if (this.state.retried && document.activeElement === document.body)
      this.wrapper.current?.focus();
  }

  retry = () => {
    this.props.onRetry();
    this.setState({ error: undefined, retried: true });
  };

  render() {
    const { error, retried } = this.state;
    if (error !== undefined && !(error instanceof ModuleLoadError)) throw error;
    const content =
      error === undefined ? (
        this.props.children
      ) : (
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
    // Until a retry, the content stands on its own, as the page lays it out.
    if (!retried) return content;
    return (
      <div ref={this.wrapper} tabIndex={-1} className="docs-load-boundary">
        {content}
      </div>
    );
  }
}
