import { Component, type ReactNode } from 'react';
import { Alert, Link, Stack } from '@envsemble/envui';
import { errorMessage } from '../template/LoadBoundary';
import { PageHeader } from './PageHeader';

interface PageBoundaryProps {
  /** The page's title, kept as its heading when the page fails. */
  title: string;
  /** The route the page shows; going to another one renders a page again. */
  route: string;
  children: ReactNode;
}

interface PageBoundaryState {
  failure: { error: unknown } | null;
}

/**
 * Keeps a page that fails to render from taking the catalogue down: it says so in place of the
 * page, and the navigation around it still works. Going to another page renders that one.
 */
export class PageBoundary extends Component<PageBoundaryProps, PageBoundaryState> {
  state: PageBoundaryState = { failure: null };

  static getDerivedStateFromError(error: unknown): PageBoundaryState {
    return { failure: { error } };
  }

  componentDidUpdate(previous: PageBoundaryProps, previousState: PageBoundaryState) {
    // A page that had failed is rendered again once people go elsewhere. A page that fails on the
    // way there keeps its message.
    if (previousState.failure && this.state.failure && previous.route !== this.props.route)
      this.setState({ failure: null });
  }

  render() {
    const { failure } = this.state;
    if (!failure) return this.props.children;
    return (
      <Stack gap={7} className="docs-article">
        <PageHeader title={this.props.title} breadcrumb="envUI" />
        <Alert
          tone="error"
          title="This page failed to render"
          action={<Link href="#/overview">Return to overview</Link>}
        >
          {errorMessage(failure.error)}
        </Alert>
      </Stack>
    );
  }
}
