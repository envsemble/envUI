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
  title: string;
  route: string;
  onRetry: () => void;
  children: ReactNode;
}

interface PageBoundaryState {
  failure: { error: unknown; focused: Element | null } | null;
  offline: boolean;
}

export class PageBoundary extends Component<PageBoundaryProps, PageBoundaryState> {
  state: PageBoundaryState = { failure: null, offline: false };

  private alert = createRef<HTMLDivElement>();

  private retryPressedSinceFailure = false;

  static getDerivedStateFromError(error: unknown): PageBoundaryState {
    return { failure: { error, focused: focusedElement() }, offline: false };
  }

  componentDidUpdate(previous: PageBoundaryProps, previousState: PageBoundaryState) {
    const { failure } = this.state;
    if (failure && failure !== previousState.failure) {
      const retryDroppedFocus =
        this.retryPressedSinceFailure && document.activeElement === document.body;
      this.retryPressedSinceFailure = false;
      if (retryDroppedFocus || focusDropped(failure.focused)) this.alert.current?.focus();
    }
    const failedPageLeft =
      previousState.failure !== null && failure !== null && previous.route !== this.props.route;
    if (failedPageLeft) this.setState({ failure: null, offline: false });
  }

  retry = () => {
    this.retryPressedSinceFailure = true;
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
    const onOverview = this.props.route.split(/[/?]/)[0] === 'overview';
    return (
      <Column gap={7} className="site-article">
        <SiteBanner title={this.props.title} breadcrumb="envUI" />
        <Alert
          ref={this.alert}
          tabIndex={-1}
          tone="danger"
          title="This page failed to render"
          actions={
            onOverview ? (
              <Button variant="secondary" onClick={() => void this.reload()}>
                Reload the page
              </Button>
            ) : (
              <Link href={routeHref(homeRoute)}>Return to overview</Link>
            )
          }
        >
          {errorMessage(failure.error)}
          {onOverview && (
            <div role="status">
              {offline && 'The connection seems to be down. Reload the page once it is back.'}
            </div>
          )}
        </Alert>
      </Column>
    );
  }
}
