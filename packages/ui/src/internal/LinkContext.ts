'use client';

import { createContext, useContext, type ComponentPropsWithRef, type ComponentType } from 'react';

/** Props envUI passes to the application's link: native anchor attributes with a string href. */
export type LinkComponentProps = ComponentPropsWithRef<'a'> & { href: string };

/**
 * The link component for envUI destinations, which LinkProvider sets: the application's router
 * link, or a native anchor outside any provider.
 */
export const LinkComponentContext = createContext<ComponentType<LinkComponentProps> | 'a'>('a');

/** The anchor component for envUI destinations: the provider's link or a native anchor. */
export function useLinkComponent() {
  return useContext(LinkComponentContext);
}
