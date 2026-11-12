// Minimal declarations of the routers the setup page's recipes use, as far as the recipes use them,
// so tests/docs/RouterRecipes.test.ts type-checks the recipes without installing the routers. Each
// link takes an anchor's props and a ref, as the router's own does.

declare module '@tanstack/react-router' {
  import type { ComponentPropsWithRef, JSX } from 'react';
  /**
   * With a registered router, `to` is one of the routes' paths, and a plain string is rejected, as
   * here: these paths stand in for an application's routes.
   */
  type RoutePath = '/' | '/projects' | '/projects/$projectId';
  export interface LinkProps {
    to: RoutePath;
    /** The search, apart from the path: an object of the route's search params. */
    search?: Record<string, unknown> | true;
    /** The fragment, apart from the path, without `#`. */
    hash?: string;
  }
  export function Link(props: Omit<ComponentPropsWithRef<'a'>, 'href'> & LinkProps): JSX.Element;
}

declare module 'react-router' {
  import type { ComponentPropsWithRef, JSX } from 'react';
  export function Link(
    props: Omit<ComponentPropsWithRef<'a'>, 'href'> & { to: string },
  ): JSX.Element;
  export function useLocation(): { pathname: string; search: string; hash: string };
}

declare module 'next/link' {
  import type { ComponentPropsWithRef, JSX } from 'react';
  export default function Link(
    props: ComponentPropsWithRef<'a'> & { href: string; prefetch?: boolean | null },
  ): JSX.Element;
}
