'use client';

import { DirectionProvider } from '@base-ui/react/direction-provider';
import { Toolbar as BaseToolbar } from '@base-ui/react/toolbar';
import { useDirectionScope } from './useDirection.js';

/**
 * Base UI's Toolbar.Root told the text direction, so a horizontal toolbar's arrow keys follow it:
 * EnvUIProvider's dir, else the root's computed direction, read as it mounts and as focus enters
 * it. Base UI alone reads only its own DirectionProvider, which says ltr unless told.
 */
export function DirectedToolbarRoot({ ref, onFocus, ...props }: BaseToolbar.Root.Props) {
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
      />
    </DirectionProvider>
  );
}
