'use client';

// @client-module It provides the link context, which React reads only in client modules.

import type { ComponentType, ReactNode } from 'react';
import { LinkComponentContext, type LinkComponentProps } from '../internal/LinkContext.js';

export type { LinkComponentProps };

export interface LinkProviderProps {
  /**
   * Renders every envUI destination (Button, Link, the destinations of Bar, Rail and Drawer, Card,
   * Pager links and menu links with href). It must render an anchor and forward native props and
   * ref, for example a router's link that navigates on the client.
   */
  component: ComponentType<LinkComponentProps>;
  children: ReactNode;
}

/** Connects envUI links to the application's router without a router dependency in envUI. */
export function LinkProvider({ component, children }: LinkProviderProps) {
  return <LinkComponentContext value={component}>{children}</LinkComponentContext>;
}
