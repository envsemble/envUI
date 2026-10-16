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
 * Whether a file that failed to load can be asked for again in place. A browser keeps a module that
 * failed as failed under its URL for as long as the page is open. In development, Vite serves each
 * file at its own path, which can be asked for under a new URL. A build's chunks have hashed names
 * that a loader doesn't reveal, so there only reloading the page fetches them again.
 */
export const canRetryLoad = import.meta.env.DEV;

/**
 * A loader that asks for a module again after it failed to load, in development: it asks for the
 * file at `path`, relative to `base`, under a new URL, with `query` (such as `raw`) first. A build,
 * where LoadBoundary offers no retry, keeps `load` as it is.
 */
export function reloadModule<T>(
  load: () => Promise<T>,
  path: string,
  base: string,
  { query, pick = (module) => module as T }: { query?: string; pick?: (module: unknown) => T } = {},
): () => Promise<T> {
  if (!canRetryLoad) return load;
  const { pathname } = new URL(path, base);
  return () =>
    import(/* @vite-ignore */ `${pathname}?${query ? `${query}&` : ''}retry=${Date.now()}`).then(
      pick,
    );
}

/**
 * Reloads the page, which fetches the files of the current deployment. WebKit keeps a module that
 * failed to load, such as one Vite preloaded with a link, as failed for the whole tab, across
 * reloads, until the file is fetched again; so the page's scripts that arrived empty are fetched
 * anew first.
 */
export async function reloadPage() {
  const failed = performance
    .getEntriesByType('resource')
    .filter(
      (entry): entry is PerformanceResourceTiming =>
        entry instanceof PerformanceResourceTiming &&
        ['script', 'link', 'other'].includes(entry.initiatorType) &&
        entry.decodedBodySize === 0 &&
        new URL(entry.name).origin === window.location.origin,
    );
  await Promise.all(
    failed.map(({ name }) => fetch(name, { cache: 'reload' }).catch(() => undefined)),
  );
  window.location.reload();
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
 * with a retry in development and a reload of the page, which fetches the current files. Any other
 * error, such as a bug in an example, is shown in place as a failure to render, with its message.
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
              {canRetryLoad && (
                <Button variant="secondary" onClick={this.retry}>
                  Try again
                </Button>
              )}
              <Button
                variant={canRetryLoad ? 'text' : 'secondary'}
                onClick={() => void reloadPage()}
              >
                Reload the page
              </Button>
            </ActionGroup>
          }
        >
          The catalogue may have been updated since this page opened, or the connection dropped.
          {!canRetryLoad && ` Reloading the page loads the ${what} again.`}
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
