'use client';

import {
  DirectionProvider,
  useDirection as useBaseDirection,
} from '@base-ui/react/direction-provider';
import { Toolbar as BaseToolbar } from '@base-ui/react/toolbar';
import { useDirectionScope } from '../../internal/provider/useDirection.js';

export function DirectedToolbarRoot({ ref, onFocus, children, ...props }: BaseToolbar.Root.Props) {
  const directionControlsInsideKeep = useBaseDirection();
  const rootDirectionForArrowKeys = useDirectionScope<HTMLDivElement>(ref);
  return (
    <DirectionProvider direction={rootDirectionForArrowKeys.direction}>
      <BaseToolbar.Root
        {...props}
        ref={rootDirectionForArrowKeys.ref}
        onFocus={(event) => {
          rootDirectionForArrowKeys.onFocus();
          onFocus?.(event);
        }}
      >
        <DirectionProvider direction={directionControlsInsideKeep}>{children}</DirectionProvider>
      </BaseToolbar.Root>
    </DirectionProvider>
  );
}
