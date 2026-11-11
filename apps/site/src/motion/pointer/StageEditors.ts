/*
 * The rich text editors of one stage, as the virtual pointer uses them (VirtualPointer.ts):
 * RichTextEditor's Tiptap editor, which Tiptap keeps on the element ProseMirror edits. The pointer
 * selects in an editor through the editor's state and types into it through its view
 * (VirtualSelection.ts, KeyboardControl.ts). An editor the pointer has used no longer scrolls its
 * selection into view, as a command does after it edits, since that would scroll the reader's page;
 * dispose restores each editor's own scrolling.
 */
import type { RichTextEditorHandle } from '@envsemble/envui/rich-text';

/** A rich text editor, as RichTextEditor provides it. */
export type RichEditor = NonNullable<RichTextEditorHandle['editor']>;

/** What ProseMirror calls before it scrolls an editor's selection into view. */
type ScrollToSelection = RichEditor['view']['props']['handleScrollToSelection'];

export class StageEditors {
  /** The editors used, each with its previous handler for scrolling its selection, to restore. */
  private readonly steadied = new Map<RichEditor, ScrollToSelection>();

  /**
   * The rich text editor a node is in, or that its content element holds. From the first time it is
   * asked for, the editor no longer scrolls the page. Returns nothing where there is no editor, or
   * it isn't mounted.
   */
  use(node: Node | null) {
    const element = node instanceof Element ? node : (node?.parentElement ?? null);
    const content =
      element?.closest<HTMLElement>('.ProseMirror') ??
      element?.querySelector<HTMLElement>('.ProseMirror') ??
      null;
    // Tiptap puts its editor on the element ProseMirror renders into, which the DOM's types don't
    // know about.
    const editor = (content as (HTMLElement & { editor?: RichEditor }) | null)?.editor;
    if (!content || !editor || editor.isDestroyed) return null;
    if (!this.steadied.has(editor)) {
      this.steadied.set(editor, editor.view.props.handleScrollToSelection);
      editor.view.setProps({ handleScrollToSelection: () => true });
    }
    return { editor, content };
  }

  /** Restores every used editor's own scrolling, when the stage's pointer goes away. */
  dispose() {
    for (const [editor, own] of this.steadied)
      if (!editor.isDestroyed) editor.view.setProps({ handleScrollToSelection: own });
    this.steadied.clear();
  }
}
