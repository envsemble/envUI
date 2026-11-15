import type { RichTextEditorHandle } from '@envsemble/envui/rich-text';

export type RichEditor = NonNullable<RichTextEditorHandle['editor']>;

type ScrollToSelection = RichEditor['view']['props']['handleScrollToSelection'];

export class StageEditors {
  private readonly steadied = new Map<RichEditor, ScrollToSelection>();

  use(node: Node | null) {
    const element = node instanceof Element ? node : (node?.parentElement ?? null);
    const content =
      element?.closest<HTMLElement>('.ProseMirror') ??
      element?.querySelector<HTMLElement>('.ProseMirror') ??
      null;
    const editor = (content as (HTMLElement & { editor?: RichEditor }) | null)?.editor;
    if (!content || !editor || editor.isDestroyed) return null;
    if (!this.steadied.has(editor)) {
      this.steadied.set(editor, editor.view.props.handleScrollToSelection);
      editor.view.setProps({ handleScrollToSelection: () => true });
    }
    return { editor, content };
  }

  dispose() {
    for (const [editor, own] of this.steadied)
      if (!editor.isDestroyed) editor.view.setProps({ handleScrollToSelection: own });
    this.steadied.clear();
  }
}
