// What every component that paints a container shares to become a skeleton: its prop, and the
// attributes that mark its root. Plain functions, so a server component calls them too.

export interface SkeletonProps {
  /**
   * Shows the component, and everything inside it, as a skeleton while its content loads: text
   * becomes bars, icons, avatars, media and controls filled shapes of their size, and borders and
   * corners stay. It is a busy region, and its content can't be focused or read until it loads.
   * Turning it on or off renders its content anew, so state inside it starts over.
   * @default false
   */
  skeleton?: boolean;
}

/**
 * The attributes of a skeleton's root: data-env-skeleton, which the styles and dev mode follow,
 * and aria-busy, so assistive technology hears one busy region. Its content, not the root, is
 * inert: inSkeleton wraps it.
 */
export interface SkeletonAttributes {
  'data-env-skeleton'?: '';
  'aria-busy'?: true;
}

/** Marks a skeleton's root: busy, and followed by the skeleton's styles. */
export function skeletonAttributes(skeleton: boolean | undefined): SkeletonAttributes {
  return skeleton ? { 'data-env-skeleton': '', 'aria-busy': true } : {};
}

/**
 * Marks a skeleton list's root, which can't hold a wrapper: inert as a whole, since no element may
 * stand between it and its rows. A visually hidden status beside it, which SkeletonStatus renders,
 * says what is loading. A table holds its wrapper around the table, in its scroll region.
 */
export function skeletonListAttributes(skeleton: boolean | undefined) {
  return skeleton ? ({ 'data-env-skeleton': '', inert: true } as const) : {};
}

/**
 * Whether a prop is given at all, even as undefined, such as `title={item.title}` over a
 * placeholder item: its slot renders, empty, so a skeleton shows a bar there.
 */
export function given(props: object, name: string): boolean {
  return Object.prototype.hasOwnProperty.call(props, name);
}
