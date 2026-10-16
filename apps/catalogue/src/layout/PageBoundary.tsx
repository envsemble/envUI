import { Component, createRef, type ReactNode } from 'react';
import { Alert, Button, Link, Stack } from '@envsemble/envui';
import { errorMessage, focusDropped, focusedElement, reloadPage } from '../template/LoadBoundary';
import { PageHeader } from './PageHeader';

interface PageBoundaryProps {
  /** The page's title, kept as its heading when the page fails. */
  title: string;
  /** The route the page shows; going to another one renders a page again. */
  route: string;
  children: ReactNode;
}

interface PageBoundaryState {
  /** What the page threw, if it did, and what had focus then. */
  failure: { error: unknown; focused: Element | null } | null;
}

/**
 * Keeps a page that fails to render from taking the catalogue down: it says so in place of the
 * page, and the navigation around it still works. Going to another page renders that one. A failure
 * that takes away the element people were using takes the focus.
 */
export class PageBoundary extends Component<PageBoundaryProps, PageBoundaryState> {
  state: PageBoundaryState = { failure: null };

  /** The failure's message, which takes the focus that the page dropped. */
  private alert = createRef<HTMLDivElement>();

  static getDerivedStateFromError(error: unknown): PageBoundaryState {
    return { failure: { error, focused: focusedElement() } };
  }

  componentDidUpdate(previous: PageBoundaryProps, previousState: PageBoundaryState) {
    const { failure } = this.state;
    if (failure && failure !== previousState.failure && focusDropped(failure.focused))
      this.alert.current?.focus();
    // A page that had failed is rendered again once people go elsewhere. A page that fails on the
    // way there keeps its message.
    if (previousState.failure && failure && previous.route !== this.props.route)
      this.setState({ failure: null });
  }

  render() {
    const { failure } = this.state;
    if (!failure) return this.props.children;
    // The overview is where the link leads, so there it offers to load the catalogue again.
    const overview = this.props.route.split(/[/?]/)[0] === 'overview';
    return (
      <Stack gap={7} className="docs-article">
        <PageHeader title={this.props.title} breadcrumb="envUI" />
        <Alert
          ref={this.alert}
          tabIndex={-1}
          tone="error"
          title="This page failed to render"
          action={
            overview ? (
              <Button variant="secondary" onClick={() => void reloadPage()}>
                Reload the page
              </Button>
            ) : (
              <Link href="#/overview">Return to overview</Link>
            )
          }
        >
          {errorMessage(failure.error)}
        </Alert>
      </Stack>
    );
  }
}
