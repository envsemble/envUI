declare module '@tanstack/react-router' {
  import type { ComponentPropsWithRef, JSX } from 'react';
  type RoutePath = '/' | '/projects' | '/projects/$projectId';
  export interface LinkProps {
    to: RoutePath;
    search?: Record<string, unknown> | true;
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
