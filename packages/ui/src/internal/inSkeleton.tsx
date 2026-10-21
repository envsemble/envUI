import type { ReactNode } from 'react';
import { SkeletonScope } from '../foundations/SkeletonScope.js';

/**
 * A server component's content, in a SkeletonScope while it is a skeleton: loaded, it renders as it
 * is, so a server-rendered component sends no client code unless it is a skeleton.
 */
export function inSkeleton(skeleton: boolean, children: ReactNode): ReactNode {
  return skeleton ? <SkeletonScope skeleton>{children}</SkeletonScope> : children;
}
