# RichText

## Edit and render the same document

```tsx
import { RichTextEditor, RichText } from '@envsemble/envui/rich-text';

<RichTextEditor label="Notes" name="notes"
  value={notes} onValueChange={setNotes} />
<RichText>{notes}</RichText>
```

### Props & contracts

| Name                           | Contract                                                                                                                 |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| value / defaultValue           | Controlled or initial Markdown string; external value replacements update the document                                   |
| onValueChange                  | Receives normalized Markdown after an edit                                                                               |
| label / hint / error / variant | Shared accessible field presentation; outlined by default, or plain                                                      |
| toolbar                        | Standard Tiptap formatting actions; false hides the toolbar or pass the enabled command names                            |
| disabled / readOnly            | Prevent edits while retaining the document                                                                               |
| name / form                    | Include Markdown in native form submission                                                                               |
| RichText children              | Render saved Markdown with the same schema and reference behavior                                                        |
| Markdown support               | Tiptap beta Markdown formatting subset; normalizes source, renders raw HTML as literal text and supports ordinary tables |

## Application reference lookup

```tsx
import {
  RichTextEditor, RichText,
  type RichTextReferenceSource,
} from '@envsemble/envui/rich-text';

// Keep sources stable, for example at module scope or with useMemo.
const references: RichTextReferenceSource[] = [
  {
    char: '@', label: 'Contacts',
    items: async ({ query, signal }) => {
      const response = await fetch('/api/contacts?' +
        new URLSearchParams({ query }), { signal });
      if (!response.ok) throw new Error('Lookup failed');
      const contacts = await response.json();
      return contacts.map((contact: { id: string; name: string; url: string }) => ({
        id: contact.id, label: contact.name, href: contact.url, kind: 'contact',
      }));
    },
  },
];

<RichTextEditor value={notes} onValueChange={setNotes} references={references} />
<RichText onReferenceClick={(reference, event) => {
  event.preventDefault();
  openReference(reference.id);
}}>{notes}</RichText>
```

### Props & contracts

| Name                                    | Contract                                                                                                                                                      |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| references                              | Sources configure their own trigger, menu label and sync/async lookup callback                                                                                |
| items({ query, signal })                | Return { id, label, kind?, href? }; use the AbortSignal for cancellable searches                                                                              |
| minQueryLength / debounce / allowSpaces | Optional Tiptap query matching and lookup timing                                                                                                              |
| Stable references                       | Generic [reference ...] Markdown shortcodes percent-encode ID, label, kind, href, trigger and optional formatting marks                                       |
| renderReference                         | Optional shared renderer receives the reference and { readOnly, selected }                                                                                    |
| onReferenceClick / onLinkClick          | Application navigation callbacks receive the reference or link URL and activation event                                                                       |
| onLinkClick event                       | Native MouseEvent in the editor, React mouse event in the viewer; use the href argument for the destination and shared preventDefault/stopPropagation methods |

## Application attachments and links

```tsx
import { RichTextEditor } from '@envsemble/envui/rich-text';

<RichTextEditor
  value={notes}
  onValueChange={setNotes}
  accept="image/*,.pdf,.txt"
  onUpload={async (file, { signal }) => {
    const attachment = await uploadAttachment(file, { signal });
    return {
      kind: file.type.startsWith('image/') ? 'image' : 'file',
      id: attachment.id,
      label: file.name,
      url: attachment.url,
    };
  }}
  onRequestLink={async ({ selectedText }) => {
    const link = await openLinkPicker();
    return link ? { label: selectedText || link.label, href: link.url } : null;
  }}
/>;
```

### Props & contracts

| Name                       | Contract                                                                                                                                   |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| onUpload(file, { signal }) | Application returns { url, label, kind: "image" \| "file", id? }, or null to cancel                                                        |
| accept / multiple          | Native file selection restrictions and optional multiple selection                                                                         |
| Image / file result        | Images become Markdown images; files become stable references, using id or the URL as fallback identity                                    |
| onRequestLink              | Application picker can return { label, href }, null, or a Promise; otherwise use the standard link dialog                                  |
| Link selection             | Apply the returned href to the existing selection, retaining formatting and reference IDs; the returned label is used at a collapsed caret |
| Links around references    | An explicit link around a reference takes precedence over the reference's own destination                                                  |

## Tiptap commands and extension points

```tsx
import { useRef } from 'react';
import {
  RichTextEditor,
  createRichTextExtensions,
  type RichTextEditorHandle,
} from '@envsemble/envui/rich-text';

const editorRef = useRef<RichTextEditorHandle>(null);

<RichTextEditor ref={editorRef} value={notes} onValueChange={setNotes} slashCommands />;

// Programmatic edits use Tiptap's normal command API.
editorRef.current?.editor?.chain().focus().insertContent('Updated notes').run();

// Shared schema for application integrations; extra extensions need Markdown support.
const extensions = createRichTextExtensions();
```

### Props & contracts

| Name                              | Contract                                                                                                |
| --------------------------------- | ------------------------------------------------------------------------------------------------------- |
| slashCommands                     | true enables standard block commands; an array adds { id, label, run(editor) } application commands     |
| Slash trigger                     | Use <kbd>/</kbd> for a reference source or slash commands in a given editor; do not configure both      |
| ref.editor                        | The public Tiptap Editor, or null before mount; use its commands/chains for application updates         |
| extensions                        | Stable additional Tiptap extensions, shared with RichText; implement Markdown parsing and serialization |
| createRichTextExtensions(options) | Build the same base schema for other Tiptap integrations; extensions append to the base set             |

## Guidelines

- Use RichTextEditor for direct formatted editing. Use MarkdownEditor when people need to edit literal Markdown source; use Markdown for broader CommonMark display, with tables, task lists and footnotes.
- The optional @envsemble/envui/rich-text entry contains Tiptap. Basic UI and content imports remain separate; use the shared envUI stylesheet and Theme boundary.
- Tiptap owns the document, selection, formatting, undo/redo, paste and suggestion lifecycle. The application owns lookup data, permissions, navigation, uploads, persistence and save/cancel actions.
- Markdown support follows the Tiptap schema and the beta Markdown extension. It normalizes formatting rather than preserving the original source byte for byte. Unsupported syntax needs an application extension or the Markdown renderer.
- Raw HTML in Markdown is displayed as literal text consistently on the server and in the browser. Ordinary Markdown tables are supported; merged cells and tables with block content requiring HTML are outside the Markdown subset.
- References save a stable ID and label in generic inline Markdown syntax. The library does not resolve IDs to product records or routes; the application supplies reference items and rendering or activation callbacks.
- RichText uses the same extensions and reference rendering as RichTextEditor, with editing disabled. Keep the same extension configuration when displaying saved content.
- Suggestion menus use <kbd>↑</kbd> and <kbd>↓</kbd> to move, <kbd>Enter</kbd> to select and <kbd>Esc</kbd> to dismiss. Loading, empty and failure states stay in the library; source callbacks return application data and may use the supplied AbortSignal.
- Use <kbd>/</kbd> as either a reference trigger or the optional slash command trigger in each editor. Keep reference source and extension arrays stable so React updates retain the editing session.

TypeScript declarations provide the complete public API.

## Related topics

- [Markdown](../components/markdown.md)
- [TextField](../components/text-field.md)
- [Composition & extension](../foundations/composition.md)
- [Accessibility](../foundations/accessibility.md)
