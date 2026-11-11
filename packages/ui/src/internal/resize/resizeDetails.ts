// Shared by every resizable component and its resize hooks; the index entry exports it.

/** What a resize callback receives beside the new width or widths. */
export interface ResizeDetails {
  /**
   * false while people drag; true as a drag ends, a key moves the edge or a double click resets
   * it, the width to save.
   */
  committed: boolean;
}
