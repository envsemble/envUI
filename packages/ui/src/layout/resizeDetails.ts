// Shared by every resizable component. It imports nothing, so the internal resize hooks can
// report it: tests/composition/Rules.json puts it in the internal layer.

/** What a resize callback receives beside the new width or widths. */
export interface ResizeDetails {
  /**
   * false while people drag; true as a drag ends, a key moves the edge or a double click resets
   * it, the width to save.
   */
  committed: boolean;
}
