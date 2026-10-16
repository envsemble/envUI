import {
  createContext,
  useContext,
  type ComponentPropsWithRef,
  type ComponentType,
  type ReactNode,
} from 'react';

/** Props envUI passes to the application's link: native anchor attributes with a string href. */
export type LinkComponentProps = ComponentPropsWithRef<'a'> & { href: string };

const LinkComponentContext = createContext<ComponentType<LinkComponentProps> | 'a'>('a');

export interface LinkProviderProps {
  /**
   * Renders every envUI destination (Button, Link, NavList.Item, Card, Pager links and menu
   * links with href). It must render an anchor and forward native props and ref, for example a
   * router's link that navigates on the client.
   */
  component: ComponentType<LinkComponentProps>;
  children: ReactNode;
}

/** Connects envUI links to the application's router without a router dependency in envUI. */
export function LinkProvider({ component, children }: LinkProviderProps) {
  return <LinkComponentContext value={component}>{children}</LinkComponentContext>;
}

/** The anchor component for envUI destinations: the provider's link or a native anchor. */
export function useLinkComponent() {
  return useContext(LinkComponentContext);
}
