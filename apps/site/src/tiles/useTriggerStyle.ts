import type { CSSProperties } from 'react';

/**
 * The style of the button under a dialog's tile: hidden at once as the dialog opens over it, and
 * fading in again as soon as the dialog has faded out (Dialog.css), so it never shows through the
 * dialog and the stage is never left empty while the dialog comes and goes.
 */
export function useTriggerStyle(open: boolean): CSSProperties {
  return open
    ? { opacity: 0 }
    : {
        opacity: 1,
        transition:
          'opacity var(--env-motion-duration-fast) var(--env-motion-ease) var(--env-motion-duration-fast)',
      };
}
