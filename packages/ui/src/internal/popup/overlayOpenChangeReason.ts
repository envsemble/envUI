interface OverlayOpenChangeReasons {
  /** A press on the trigger. */
  'trigger-press': true;
  /** The pointer resting on the trigger or leaving it. */
  'trigger-hover': true;
  /** Focus reaching the trigger or leaving it. */
  'trigger-focus': true;
  /** A press in a combobox's text field. */
  'input-press': true;
  /** Typing in a combobox's text field. */
  'input-change': true;
  /** Emptying a combobox's text field. */
  'input-clear': true;
  /** A press outside the overlay. */
  'outside-press': true;
  /** Esc. */
  'escape-key': true;
  /** The browser's close request, such as the Back gesture on Android. */
  'close-watcher': true;
  /** A close button, or a close the content asks for. */
  'close-press': true;
  /** Panes' back button, from a detail to its list. */
  'back-press': true;
  /** Focus leaving the overlay. */
  'focus-out': true;
  /** A chosen item, such as a menu's command, an option or a day. */
  'item-press': true;
  /** The arrow keys. */
  'list-navigation': true;
  /** A clear button. */
  'clear-press': true;
  /** A press on a chip's remove button. */
  'chip-remove-press': true;
  /** A swipe toward the edge, which closes a sheet. */
  swipe: true;
  /** Another menu opening in its place. */
  'sibling-open': true;
  /** A press on the trigger let go outside it and the overlay, which takes back the opening it began. */
  'cancel-open': true;
  /** The window resizing. */
  'window-resize': true;
  /** The application, or the component itself, such as after a confirmed action. */
  'imperative-action': true;
  /** None of these. */
  none: true;
}

/** Why an overlay asks to open or close, as Base UI reports it or envUI's own controls do. */
export type OverlayOpenChangeReason = keyof OverlayOpenChangeReasons;
