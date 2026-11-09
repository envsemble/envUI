import { Component, createRef, type ReactNode, type RefObject } from 'react';
import { Alert, Button, Row } from '@envsemble/envui';

/** A file that a part of a page loads on its own and that failed to arrive. */
class ModuleLoadError extends Error {
  constructor(cause: unknown) {
    super('A file of the catalogue failed to load', { cause });
    this.name = 'ModuleLoadError';
  }
}

/** Whether an error is a file that failed to load, rather than a failure to render. */
export const isLoadFailure = (error: unknown) => error instanceof ModuleLoadError;

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
 * file at `path`, relative to `base`, under a new URL, with `query` (such as `raw`) last. A build,
 * where LoadBoundary offers no retry, keeps `load` as it is.
 */
export function reloadModule<T>(
  load: () => Promise<T>,
  path: string,
  base: string,
  // Without pick, the module is the T its caller asks for.
  { query, pick = (module) => module as T }: { query?: string; pick?: (module: unknown) => T } = {},
): () => Promise<T> {
  if (!canRetryLoad) return load;
  const { pathname } = new URL(path, base);
  return () =>
    import(/* @vite-ignore */ `${pathname}?retry=${Date.now()}${query ? `&${query}` : ''}`).then(
      pick,
    );
}

/** Whether this is the built site, whose parts load from files of their own. */
const hostedBuild = import.meta.env.PROD;

/**
 * The files of the hosted site behind each part that loads on its own, from the
 * module-files.json that scripts/site/SiteModuleFiles.ts writes; null when the connection seems down:
 * the map is small, so one that hasn't arrived in 15 seconds counts as down.
 */
async function moduleFiles(): Promise<Record<string, string[]> | null> {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}module-files.json`, {
      cache: 'no-cache',
      signal: AbortSignal.timeout(15_000),
    });
    // module-files.json, as SiteModuleFiles.ts writes it; a build without the map, or an answer
    // that isn't one, still reloads.
    return response.ok ? ((await response.json()) as Record<string, string[]>) : {};
  } catch (error) {
    return error instanceof SyntaxError ? {} : null;
  }
}

/**
 * Reloads the page, which fetches the files of the current deployment, unless the connection seems
 * to be down: then it resolves to false and leaves the page as it is, rather than replacing it with
 * the browser's error page. WebKit keeps a module that failed to load, such as one Vite preloaded
 * with a link, as failed for the whole tab, across reloads, until its file is fetched again; so in
 * the hosted build, the files of `modules` are fetched anew first. Each is a module's path in the
 * site app, such as `src/examples/button/CreateProject.tsx`. The connection seems down when
 * module-files.json can't be fetched, or none of those files can; a file that answers, even as not
 * found after a new deploy, shows that it is up. In development it always reloads.
 */
export async function reloadPage(modules: readonly string[] = []): Promise<boolean> {
  if (hostedBuild) {
    const map = await moduleFiles();
    if (!map) return false;
    const files = [...new Set(modules.flatMap((module) => map[module] ?? []))];
    // The map, a small file, has shown the connection is up, so the files take as long as they
    // need: a large one, such as the icons, may take a while on a slow link.
    const fetched = await Promise.allSettled(
      files.map((file) =>
        fetch(`${import.meta.env.BASE_URL}${file}`, { cache: 'reload' }).then((response) =>
          response.blob(),
        ),
      ),
    );
    if (fetched.length && fetched.every(({ status }) => status === 'rejected')) return false;
  }
  window.location.reload();
  return true;
}

/**
 * Where focus was when content failed, while its elements were still in place. When they are gone
 * once the failure shows and focus fell to the page, the failure is new to the person who was using
 * the content, and its message takes the focus.
 */
export function focusedElement() {
  return typeof document === 'undefined' ? null : document.activeElement;
}

/** Whether focus that was on `focused` fell to the page when the content failed. */
export function focusDropped(focused: Element | null) {
  return (
    focused !== null &&
    !focused.isConnected &&
    (document.activeElement === document.body || document.activeElement === null)
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
  /**
   * The modules that load it, by their paths in the site app, such as
   * `src/examples/button/CreateProject.tsx`: Reload the page fetches their files again first.
   */
  modules: readonly string[];
  /** Loads it again: drops what failed, so the next render fetches it anew. */
  onRetry: () => void;
  children: ReactNode;
}

interface LoadBoundaryState {
  /** What the content threw, if it did, and what had focus then. */
  failure: { error: unknown; focused: Element | null } | null;
  /** Whether people asked to load it again, which keeps a focusable wrapper around it. */
  wrapped: boolean;
  /** Whether a reload found the connection down, and left the page as it was. */
  offline: boolean;
}

/**
 * Keeps a part of a page that loads on its own, such as an example, from taking the page down. When
 * its file fails to load, as after a new deploy that removed the old file, it says so in place,
 * with a retry in development and a reload of the page, which fetches the current files. Any other
 * error, such as a bug in an example, is shown in place as a failure to render, with its message.
 * A failure that takes away the element people were using takes the focus.
 */
export class LoadBoundary extends Component<LoadBoundaryProps, LoadBoundaryState> {
  state: LoadBoundaryState = { failure: null, wrapped: false, offline: false };

  /** What focus goes to once Try again, which had it, is gone. */
  private wrapper = createRef<HTMLDivElement>();

  /** The failure's message, which takes the focus that the content dropped. */
  private alert = createRef<HTMLDivElement>();

  /** Whether focus, which was on Try again, still has to return to the wrapper. */
  private focusPending = false;

  static getDerivedStateFromError(error: unknown): Partial<LoadBoundaryState> {
    return { failure: { error, focused: focusedElement() }, offline: false };
  }

  componentDidUpdate(_: LoadBoundaryProps, previous: LoadBoundaryState) {
    const { failure } = this.state;
    if (failure && failure !== previous.failure && focusDropped(failure.focused))
      this.alert.current?.focus();
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
    this.setState({ failure: null, wrapped: true, offline: false });
  };

  reload = async () => {
    this.setState({ offline: false });
    if (!(await reloadPage(this.props.modules))) this.setState({ offline: true });
  };

  render() {
    const { failure, wrapped, offline } = this.state;
    const { what } = this.props;
    let content: ReactNode;
    if (!failure) content = this.props.children;
    else if (!isLoadFailure(failure.error))
      content = (
        <Alert ref={this.alert} tabIndex={-1} tone="danger" title={`This ${what} failed to render`}>
          {errorMessage(failure.error)}
        </Alert>
      );
    else
      content = (
        <LoadFailure
          what={what}
          alert={this.alert}
          offline={offline}
          onRetry={this.retry}
          onReload={() => void this.reload()}
        />
      );
    // Until a retry, the content stands on its own, as the page lays it out.
    if (!wrapped) return content;
    return (
      <div ref={this.wrapper} tabIndex={-1} className="site-load-boundary">
        {content}
      </div>
    );
  }
}

/**
 * The message for a part that failed to load, `what` naming it, such as an example or a page:
 * Try again in development, where the file can be asked for again in place (canRetryLoad), and
 * Reload the page, which fetches the current files. `offline` says a reload found the connection
 * down. `alert` is the message's element, which takes the focus a failure drops.
 */
export function LoadFailure({
  what,
  alert,
  offline,
  onRetry,
  onReload,
}: {
  what: string;
  alert: RefObject<HTMLDivElement | null>;
  offline: boolean;
  onRetry: () => void;
  onReload: () => void;
}) {
  return (
    <Alert
      ref={alert}
      tabIndex={-1}
      tone="warning"
      title={`The ${what} could not load`}
      actions={
        <Row wrap align="center" gap={4}>
          {canRetryLoad && (
            <Button variant="secondary" onClick={onRetry}>
              Try again
            </Button>
          )}
          <Button variant={canRetryLoad ? 'text' : 'secondary'} onClick={onReload}>
            Reload the page
          </Button>
        </Row>
      }
    >
      The catalogue may have been updated since this page opened, or the connection dropped.
      {!canRetryLoad && ` Reloading the page loads the ${what} again.`}
      <span role="status">
        {offline && ' The connection seems to be down. Reload the page once it is back.'}
      </span>
    </Alert>
  );
}
