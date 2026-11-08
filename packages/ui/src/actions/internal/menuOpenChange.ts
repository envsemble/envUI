import type { OverlayOpenChangeReason } from '../../internal/popup/overlayOpenChangeReason.js';

/**
 * Why a menu asks to open or close, as Base UI says: its trigger, hover or focus, a press outside,
 * Esc, a chosen item, the arrow keys, focus leaving it, a sibling menu opening, or the application.
 */
export type OpenChangeReason = Extract<
  OverlayOpenChangeReason,
  | 'trigger-press'
  | 'trigger-hover'
  | 'trigger-focus'
  | 'outside-press'
  | 'escape-key'
  | 'item-press'
  | 'list-navigation'
  | 'focus-out'
  | 'close-press'
  | 'sibling-open'
  | 'cancel-open'
  | 'imperative-action'
  | 'none'
>;

/** What a menu's onOpenChange receives beside the requested state. */
export interface OpenChangeDetails {
  /** Why it asks to open or close. */
  reason: OpenChangeReason;
}
