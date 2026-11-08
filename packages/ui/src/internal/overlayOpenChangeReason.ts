/**
 * Why an overlay asks to open or close, as Base UI reports it or envUI's own controls do. Each
 * overlay's onOpenChange names the reasons it gives, picked from these with `Extract`.
 */
export type OverlayOpenChangeReason =
  /** A press on the trigger. */
  | 'trigger-press'
  /** The pointer resting on the trigger or leaving it. */
  | 'trigger-hover'
  /** Focus reaching the trigger or leaving it. */
  | 'trigger-focus'
  /** A press in a combobox's text field. */
  | 'input-press'
  /** Typing in a combobox's text field. */
  | 'input-change'
  /** Emptying a combobox's text field. */
  | 'input-clear'
  /** A press outside the overlay. */
  | 'outside-press'
  /** Esc. */
  | 'escape-key'
  /** The browser's close request, such as the Back gesture on Android. */
  | 'close-watcher'
  /** A close button, or a close the content asks for. */
  | 'close-press'
  /** Panes' back button, from a detail to its list. */
  | 'back-press'
  /** Focus leaving the overlay. */
  | 'focus-out'
  /** A chosen item, such as a menu's command, an option or a day. */
  | 'item-press'
  /** The arrow keys. */
  | 'list-navigation'
  /** A clear button. */
  | 'clear-press'
  /** A press on a chip's remove button. */
  | 'chip-remove-press'
  /** A swipe toward the edge, which closes a sheet. */
  | 'swipe'
  /** Another menu opening in its place. */
  | 'sibling-open'
  /** A press on the trigger let go outside it and the overlay, which takes back the opening it began. */
  | 'cancel-open'
  /** The window resizing. */
  | 'window-resize'
  /** The application, or the component itself, such as after a confirmed action. */
  | 'imperative-action'
  /** None of these. */
  | 'none';
