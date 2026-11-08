import 'react';

declare module 'react' {
  /**
   * A custom property in a style, such as a component's color property or one of the site's own,
   * which React's types leave out.
   */
  interface CSSProperties {
    [property: `--${string}`]: string | number | undefined;
  }
}
