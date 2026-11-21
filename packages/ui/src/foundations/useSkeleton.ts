'use client';

import { useContext } from 'react';
import { SkeletonContext } from '../internal/skeleton/SkeletonContext.js';

/**
 * Whether the component is inside a skeleton: a surface with `skeleton` around it. A component of
 * the application's own reads it to give its skeleton a look of its own, such as a chart's.
 */
export function useSkeleton(): boolean {
  return useContext(SkeletonContext);
}
