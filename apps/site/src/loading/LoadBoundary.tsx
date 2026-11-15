import { Component, createRef, type ReactNode, type RefObject } from 'react';
import { Alert, Button, Row } from '@envsemble/envui';

class ModuleLoadError extends Error {
  constructor(cause: unknown) {
    super('A file of the catalogue failed to load', { cause });
    this.name = 'ModuleLoadError';
  }
}

export const isLoadFailure = (error: unknown) => error instanceof ModuleLoadError;

export function loadModule<T>(load: () => Promise<T>) {
  return () =>
    load().catch((error: unknown) => {
      throw new ModuleLoadError(error);
    });
}

export const canRetryLoad = import.meta.env.DEV;

export function reloadModule<T>(
  load: () => Promise<T>,
  path: string,
  base: string,
  { query, pick = (module) => module as T }: { query?: string; pick?: (module: unknown) => T } = {},
): () => Promise<T> {
  if (!canRetryLoad) return load;
  const { pathname } = new URL(path, base);
  return () =>
    import(/* @vite-ignore */ `${pathname}?retry=${Date.now()}${query ? `&${query}` : ''}`).then(
      pick,
    );
}

const hostedBuild = import.meta.env.PROD;

const moduleFilesTimeoutMs = 15_000;

async function moduleFiles(): Promise<Record<string, string[]> | null> {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}module-files.json`, {
      cache: 'no-cache',
      signal: AbortSignal.timeout(moduleFilesTimeoutMs),
    });
    return response.ok ? ((await response.json()) as Record<string, string[]>) : {};
  } catch (error) {
    return error instanceof SyntaxError ? {} : null;
  }
}

export async function reloadPage(modules: readonly string[] = []): Promise<boolean> {
  if (hostedBuild) {
    const map = await moduleFiles();
    if (!map) return false;
    const files = [...new Set(modules.flatMap((module) => map[module] ?? []))];
    const fetched = await Promise.allSettled(
      files.map((file) =>
        fetch(`${import.meta.env.BASE_URL}${file}`, { cache: 'reload' }).then((response) =>
          response.blob(),
        ),
      ),
    );
    const noFileAnswered =
      fetched.length > 0 && fetched.every(({ status }) => status === 'rejected');
    if (noFileAnswered) return false;
  }
  window.location.reload();
  return true;
}

export function focusedElement() {
  return typeof document === 'undefined' ? null : document.activeElement;
}

const focusIsOnPage = () =>
  document.activeElement === document.body || document.activeElement === null;

export function focusDropped(focused: Element | null) {
  return focused !== null && !focused.isConnected && focusIsOnPage();
}

export function errorMessage(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  return typeof error === 'string' && error ? error : 'An unknown error.';
}

interface LoadBoundaryProps {
  what: string;
  modules: readonly string[];
  onRetry: () => void;
  children: ReactNode;
}

interface LoadBoundaryState {
  failure: { error: unknown; focused: Element | null } | null;
  wrapped: boolean;
  offline: boolean;
}

export class LoadBoundary extends Component<LoadBoundaryProps, LoadBoundaryState> {
  state: LoadBoundaryState = { failure: null, wrapped: false, offline: false };

  private wrapper = createRef<HTMLDivElement>();

  private alert = createRef<HTMLDivElement>();

  private focusReturnsToWrapper = false;

  static getDerivedStateFromError(error: unknown): Partial<LoadBoundaryState> {
    return { failure: { error, focused: focusedElement() }, offline: false };
  }

  componentDidUpdate(_: LoadBoundaryProps, previous: LoadBoundaryState) {
    const { failure } = this.state;
    if (failure && failure !== previous.failure && focusDropped(failure.focused))
      this.alert.current?.focus();
    if (!this.focusReturnsToWrapper) return;
    this.focusReturnsToWrapper = false;
    if (focusIsOnPage()) this.wrapper.current?.focus();
  }

  retry = () => {
    this.focusReturnsToWrapper = true;
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
    if (!wrapped) return content;
    return (
      <div ref={this.wrapper} tabIndex={-1} className="site-load-boundary">
        {content}
      </div>
    );
  }
}

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
