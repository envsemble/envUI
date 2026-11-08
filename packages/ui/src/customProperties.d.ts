// Ambient, so the build emits none of it: the published types keep React's CSSProperties as they
// are, and an application that sets a custom property in a style declares it as it chooses. The
// programs that type-check the library's source include this file: the library's own, the
// fixture's and the type tests'; the site declares the same in apps/site/src/CustomProperties.d.ts.
import 'react';

declare module 'react' {
  /** A custom property in a style, such as a component's private length, which React's types leave out. */
  interface CSSProperties {
    [property: `--${string}`]: string | number | undefined;
  }
}
