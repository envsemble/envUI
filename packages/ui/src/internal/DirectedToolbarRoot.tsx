'use client';

import {
  DirectionProvider,
  useDirection as useBaseDirection,
} from '@base-ui/react/direction-provider';
import { Toolbar as BaseToolbar } from '@base-ui/react/toolbar';
import { useDirectionScope } from './useDirection.js';

/**
 * Base UI's Toolbar.Root told the text direction, so a horizontal toolbar's arrow keys follow it:
 * EnvUIProvider's dir, else the root's computed direction, read as it mounts and as focus enters
 * it. Base UI alone reads only its own DirectionProvider, which says ltr unless told. Only the
 * root's keyboard reads it: the controls inside, such as a Select, keep the direction they had.
 */
export function DirectedToolbarRoot({ ref, onFocus, children, ...props }: BaseToolbar.Root.Props) {
  const outer = useBaseDirection();
  const scope = useDirectionScope<HTMLDivElement>(ref);
  return (
    <DirectionProvider direction={scope.direction}>
      <BaseToolbar.Root
        {...props}
        ref={scope.ref}
        onFocus={(event) => {
          scope.onFocus();
          onFocus?.(event);
        }}
      >
        <DirectionProvider direction={outer}>{children}</DirectionProvider>
      </BaseToolbar.Root>
    </DirectionProvider>
  );
}
