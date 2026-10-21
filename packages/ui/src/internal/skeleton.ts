// What every component that paints a container shares to become a skeleton: its prop, and the
// attributes that mark its root. Plain functions, so a server component calls them too.

export interface SkeletonProps {
  /**
   * Shows the component, and everything inside it, as a skeleton while its content loads: text
   * becomes bars, icons, avatars, media and controls filled shapes of their size, and borders and
   * corners stay. It is marked busy, and its content can't be focused or read until it loads.
   * @default false
   */
  skeleton?: boolean;
}

/**
 * The attributes of a skeleton's root: data-env-skeleton, which the styles and dev mode follow,
 * aria-busy, and inert, so nothing in it can be focused, pressed or read.
 */
export interface SkeletonAttributes {
  'data-env-skeleton'?: '';
  'aria-busy'?: true;
  inert?: true;
}

/**
 * Marks a skeleton's root. A popup, which must keep focus so people can close it, passes
 * `inert: false` and makes its content inert instead.
 */
export function skeletonAttributes(
  skeleton: boolean | undefined,
  { inert = true }: { inert?: boolean } = {},
): SkeletonAttributes {
  if (!skeleton) return {};
  return inert
    ? { 'data-env-skeleton': '', 'aria-busy': true, inert: true }
    : { 'data-env-skeleton': '', 'aria-busy': true };
}

/**
 * Whether a prop is given at all, even as undefined, such as `title={item.title}` over a
 * placeholder item: its slot renders, empty, so a skeleton shows a bar there.
 */
export function given(props: object, name: string): boolean {
  return Object.prototype.hasOwnProperty.call(props, name);
}
