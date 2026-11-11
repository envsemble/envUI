import { Component, createRef, type ReactNode } from 'react';
import { Alert, Button, Link, Column } from '@envsemble/envui';
import {
  LoadFailure,
  errorMessage,
  focusDropped,
  focusedElement,
  isLoadFailure,
  reloadPage,
} from '../loading/LoadBoundary';
import { SiteBanner } from './SiteBanner';
import { homeRoute, routeHref } from '../routes/Address';

interface PageBoundaryProps {
  /** The page's title, kept as its heading when the page fails. */
  title: string;
  /** The route the page shows; going to another one renders a page again. */
  route: string;
  /** Drops what failed to load with the page, such as its content, so it loads again. */
  onRetry: () => void;
  children: ReactNode;
}

interface PageBoundaryState {
  /** What the page threw, if it did, and what had focus then. */
  failure: { error: unknown; focused: Element | null } | null;
  /** Whether a reload found the connection down, and left the page as it was. */
  offline: boolean;
}

/**
 * Keeps a page that fails from taking the catalogue down: it says so in place of the page, and the
 * navigation around it still works. Going to another page renders that one. A page whose content
 * failed to load offers to load it again, as a part of a page does (LoadFailure): Try again in
 * development, and Reload the page. A failure that takes away the element people were using takes
 * the focus, and so does a failure again after Try again, which took the focus with it.
 */
export class PageBoundary extends Component<PageBoundaryProps, PageBoundaryState> {
  state: PageBoundaryState = { failure: null, offline: false };

  /** The failure's message, which takes the focus that the page dropped. */
  private alert = createRef<HTMLDivElement>();

  /** Whether Try again was pressed since the last failure, which took the focus away with it. */
  private retried = false;

  static getDerivedStateFromError(error: unknown): PageBoundaryState {
    return { failure: { error, focused: focusedElement() }, offline: false };
  }

  componentDidUpdate(previous: PageBoundaryProps, previousState: PageBoundaryState) {
    const { failure } = this.state;
    if (failure && failure !== previousState.failure) {
      // Try again had the focus, and is gone: a failure again takes the focus it dropped.
      const retried = this.retried && document.activeElement === document.body;
      this.retried = false;
      if (retried || focusDropped(failure.focused)) this.alert.current?.focus();
    }
    // A page that had failed is rendered again once people go elsewhere. A page that fails on the
    // way there keeps its message.
    if (previousState.failure && failure && previous.route !== this.props.route)
      this.setState({ failure: null, offline: false });
  }

  retry = () => {
    this.retried = true;
    this.props.onRetry();
    this.setState({ failure: null, offline: false });
  };

  reload = async () => {
    this.setState({ offline: false });
    if (!(await reloadPage())) this.setState({ offline: true });
  };

  render() {
    const { failure, offline } = this.state;
    if (!failure) return this.props.children;
    if (isLoadFailure(failure.error))
      return (
        <Column gap={7} className="site-article">
          <SiteBanner title={this.props.title} breadcrumb="envUI" />
          <LoadFailure
            what="page"
            alert={this.alert}
            offline={offline}
            onRetry={this.retry}
            onReload={() => void this.reload()}
          />
        </Column>
      );
    // The overview is where the link leads, so there it offers to load the catalogue again.
    const overview = this.props.route.split(/[/?]/)[0] === 'overview';
    return (
      <Column gap={7} className="site-article">
        <SiteBanner title={this.props.title} breadcrumb="envUI" />
        <Alert
          ref={this.alert}
          tabIndex={-1}
          tone="danger"
          title="This page failed to render"
          actions={
            overview ? (
              <Button variant="secondary" onClick={() => void this.reload()}>
                Reload the page
              </Button>
            ) : (
              <Link href={routeHref(homeRoute)}>Return to overview</Link>
            )
          }
        >
          {errorMessage(failure.error)}
          {/* Below the error's own message, which may not end a sentence. */}
          {overview && (
            <div role="status">
              {offline && 'The connection seems to be down. Reload the page once it is back.'}
            </div>
          )}
        </Alert>
      </Column>
    );
  }
}
