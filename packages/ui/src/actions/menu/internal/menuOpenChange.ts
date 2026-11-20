import type { OverlayOpenChangeReason } from '../../../internal/popup/overlayOpenChangeReason.js';

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

export interface OpenChangeDetails {
  /** Why it asks to open or close. */
  reason: OpenChangeReason;
}
