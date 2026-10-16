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

/** What went wrong, as a message for people: the error's own message when it has one. */
export function errorMessage(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  return typeof error === 'string' && error ? error : 'An unknown error.';
}

interface LoadBoundaryProps {
  /** What failed, for the message: an example, its code or a specimen. */
  what: string;
  /** Loads it again: drops what failed, so the next render fetches it anew. */
  onRetry: () => void;
  children: ReactNode;
}

interface LoadBoundaryState {
  /** What the content threw, if it did. */
  failure: { error: unknown } | null;
  /** Whether people asked to load it again, which keeps a focusable wrapper around it. */
  wrapped: boolean;
}

/**
 * Keeps a part of a page that loads on its own, such as an example, from taking the page down. When
 * its file fails to load, as after a new deploy that removed the old file, it says so in place,
 * with a retry and a reload of the page, which fetches the current files. Any other error, such as
 * a bug in an example, is shown in place as a failure to render, with its message.
 */
export class LoadBoundary extends Component<LoadBoundaryProps, LoadBoundaryState> {
  state: LoadBoundaryState = { failure: null, wrapped: false };

  /** What focus goes to once Try again, which had it, is gone. */
  private wrapper = createRef<HTMLDivElement>();

  /** Whether focus, which was on Try again, still has to return to the wrapper. */
  private focusPending = false;

  static getDerivedStateFromError(error: unknown): Partial<LoadBoundaryState> {
    return { failure: { error } };
  }

  componentDidUpdate() {
    // The first update after a retry replaces Try again. The focus it dropped returns here,
    // whether the content loads or fails again, and only then: later updates leave focus alone.
    if (!this.focusPending) return;
    this.focusPending = false;
    if (document.activeElement === document.body || document.activeElement === null)
      this.wrapper.current?.focus();
  }

  retry = () => {
    this.focusPending = true;
    this.props.onRetry();
    this.setState({ failure: null, wrapped: true });
  };

  render() {
    const { failure, wrapped } = this.state;
    const { what } = this.props;
    let content: ReactNode;
    if (!failure) content = this.props.children;
    else if (!(failure.error instanceof ModuleLoadError))
      content = (
        <Alert tone="error" title={`This ${what} failed to render`}>
          {errorMessage(failure.error)}
        </Alert>
      );
    else
      content = (
        <Alert
          tone="warning"
          title={`The ${what} could not load`}
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
    if (!wrapped) return content;
    return (
      <div ref={this.wrapper} tabIndex={-1} className="docs-load-boundary">
        {content}
      </div>
    );
  }
}
