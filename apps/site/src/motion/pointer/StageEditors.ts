/*
 * The rich text editors of one stage, as the pointer no one sees uses them (VirtualPointer.ts):
 * RichTextEditor's Tiptap editor, which Tiptap keeps on the element ProseMirror edits. The pointer
 * selects in an editor through its state and types into it through its view (VirtualSelection.ts,
 * KeyboardControl.ts). An editor it has used no longer scrolls its selection into view, as a
 * command does after it edits, since that would scroll the reader's page; dispose gives each its
 * own scrolling back.
 */
import type { RichTextEditorHandle } from '@envsemble/envui/rich-text';

/** A rich text editor, as RichTextEditor gives it. */
export type RichEditor = NonNullable<RichTextEditorHandle['editor']>;

/** What ProseMirror asks before it scrolls an editor's selection into view. */
type ScrollToSelection = RichEditor['view']['props']['handleScrollToSelection'];

export class StageEditors {
  /** The editors used, each with what it scrolled its selection by before, to give back. */
  private readonly steadied = new Map<RichEditor, ScrollToSelection>();

  /**
   * The rich text editor a node is in, or its content element holds, kept from scrolling the page
   * from the first time it is asked for: nothing where there is none, or it isn't mounted.
   */
  use(node: Node | null) {
    const element = node instanceof Element ? node : (node?.parentElement ?? null);
    const content =
      element?.closest<HTMLElement>('.ProseMirror') ??
      element?.querySelector<HTMLElement>('.ProseMirror') ??
      null;
    // Tiptap puts its editor on the element ProseMirror renders into, which the DOM's types don't
    // know of.
    const editor = (content as (HTMLElement & { editor?: RichEditor }) | null)?.editor;
    if (!content || !editor || editor.isDestroyed) return null;
    if (!this.steadied.has(editor)) {
      this.steadied.set(editor, editor.view.props.handleScrollToSelection);
      editor.view.setProps({ handleScrollToSelection: () => true });
    }
    return { editor, content };
  }

  /** Gives every editor used its own scrolling back, as the stage's pointer goes. */
  dispose() {
    for (const [editor, own] of this.steadied)
      if (!editor.isDestroyed) editor.view.setProps({ handleScrollToSelection: own });
    this.steadied.clear();
  }
}
