import type { ReactNode } from 'react';
import { SkeletonScope } from '../SkeletonScope.js';

/**
 * A component's content while it is a skeleton: in a SkeletonScope, which tells the components
 * inside, and an inert wrapper without a box of its own, so the content can't be focused or read
 * while the busy root stays in the accessibility tree. Loaded, it renders as it is, so a server
 * component sends no client code unless it is a skeleton; turning the skeleton on or off renders the
 * content anew.
 */
export function inSkeleton(skeleton: boolean, children: ReactNode): ReactNode {
  if (!skeleton) return children;
  return (
    <SkeletonScope skeleton>
      <div className="env-skeleton-content" inert>
        {children}
      </div>
    </SkeletonScope>
  );
}

/**
 * A list's or a table's content while it is a skeleton, whose root is inert as a whole: only the
 * SkeletonScope, with no wrapper.
 */
export function inSkeletonList(skeleton: boolean, children: ReactNode): ReactNode {
  return skeleton ? <SkeletonScope skeleton>{children}</SkeletonScope> : children;
}
