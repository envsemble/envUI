# Markdown

## Render content

```tsx
import { Markdown } from '@envsemble/envui/content';

<Markdown headingOffset={1} codeCopyable>
  {description}
</Markdown>;
```

### Props & contracts

| Name                         | Contract                                 |
| ---------------------------- | ---------------------------------------- |
| children                     | Markdown string                          |
| headingOffset / codeCopyable | Heading semantics and code-copy controls |

## Markdown source

````tsx
import { Markdown } from '@envsemble/envui/content';

const description = [
  '## Project checklist',
  '',
  'Prepare the **sample project** for review.',
  '- Review the [draft document](/documents/draft).',
  '',
  '```json',
  '{ "enabled": true, "retries": 3 }',
  '```',
].join('\n');

<Markdown headingOffset={1} codeCopyable>
  {description}
</Markdown>;
````

### Props & contracts

| Name        | Contract                                                         |
| ----------- | ---------------------------------------------------------------- |
| Code fences | Supply a language after the opening fence; code reuses CodeBlock |
| Inline code | Single backticks mark inline source within prose                 |

## Application navigation

```tsx
import { Link } from '@envsemble/envui';
import { Markdown } from '@envsemble/envui/content';

<Markdown
  renderLink={({ href, children, ...props }) => (
    <Link
      {...props}
      href={href}
      onClick={(event) => {
        if (
          !event.defaultPrevented &&
          event.button === 0 &&
          !event.metaKey &&
          !event.ctrlKey &&
          !event.shiftKey &&
          !event.altKey &&
          href.startsWith('/documents/')
        ) {
          event.preventDefault();
          openDocumentPanel(href);
        }
      }}
    >
      {children}
    </Link>
  )}
>
  {description}
</Markdown>;
```

### Props & contracts

| Name       | Contract                                                                                       |
| ---------- | ---------------------------------------------------------------------------------------------- |
| renderLink | Keep real hrefs and preserve modified clicks; the application decides which routes open panels |

## Extend rendering

```tsx
import { Markdown } from '@envsemble/envui/content';
import rehypeSlug from 'rehype-slug';

<Markdown
  headingOffset={1}
  rehypePlugins={[rehypeSlug]}
  components={{
    blockquote: ({ node: _node, ...props }) => <Callout {...props} />,
  }}
>
  {document}
</Markdown>;
```

### Props & contracts

| Name          | Contract                                                                                         |
| ------------- | ------------------------------------------------------------------------------------------------ |
| components    | react-markdown overrides merged over envUI's own; the application's win for the same element     |
| remarkPlugins | Run after envUI's own Markdown extensions                                                        |
| rehypePlugins | Run on the HTML tree, for example to add heading ids; envUI adds none of its own                 |
| Native props  | id, className and other attributes from plugins reach envUI's headings, links, tables and images |

## Edit and preview

```tsx
import { MarkdownEditor } from '@envsemble/envui/content';

<MarkdownEditor
  variant="outlined"
  sizing="content"
  label="Description"
  name="description"
  value={description}
  onValueChange={setDescription}
  previewProps={{ headingOffset: 1, codeCopyable: true }}
/>;
```

### Props & contracts

| Name                   | Contract                                                                                                    |
| ---------------------- | ----------------------------------------------------------------------------------------------------------- |
| value / defaultValue   | Controlled or initial Markdown source string                                                                |
| onValueChange          | Receives the complete updated source after typing, formatting or undo                                       |
| variant                | Source field appearance: "outlined" (default) or "plain"                                                    |
| sizing / rows          | Shared textarea sizing: fixed (default) scrolls and resizes from the bottom edge; content grows and shrinks |
| toolbar                | Heading, bold, italic, lists, quote, code and link commands; false hides it                                 |
| preview / previewProps | Write/Preview tabs and shared Markdown rendering; preview defaults to true                                  |
| onRequestLink          | Return { label, href }, null, or a Promise from an application picker                                       |
| label / hint / error   | Shared field presentation and accessible connections                                                        |
| Native textarea props  | name, rows, required, maxLength, disabled, readOnly, form, ref and source-control styling                   |

## Application link picker

```tsx
import { MarkdownEditor, type MarkdownLink } from '@envsemble/envui/content';

// The application supplies its search and picker. Resolve null to cancel.
async function requestLink({
  selectedText,
}: {
  selectedText: string;
}): Promise<MarkdownLink | null> {
  const resource = await openResourcePicker();
  return resource
    ? {
        label: selectedText || resource.name,
        href: resource.url,
      }
    : null;
}

<MarkdownEditor
  variant="outlined"
  sizing="content"
  label="Description"
  value={description}
  onValueChange={setDescription}
  onRequestLink={requestLink}
/>;
```

### Props & contracts

| Name               | Contract                                                |
| ------------------ | ------------------------------------------------------- |
| onRequestLink      | Receives selectedText; use any application-owned picker |
| Without a callback | The editor opens its standard text-and-URL link dialog  |

## Guidelines

- Markdown renders a string supplied by your application. MarkdownEditor adds source editing, formatting and a preview that uses the same Markdown renderer. Both work with ordinary Markdown strings.
- Paragraphs, headings, lists, quotes and tables use envUI typography and spacing. Code blocks reuse CodeBlock with the code theme's colors.
- Supports CommonMark plus tables, strikethrough, task lists, automatic links and footnotes. Single source newlines follow standard paragraph behavior.
- Raw HTML is ignored, except keys written as `<kbd>Ctrl</kbd>`, which render as Kbd. URLs retain the renderer’s safe protocol handling. Markdown is content, not executable components.
- Resource references are ordinary links with stable destination URLs. Labels are saved text; resource resolution, permissions and missing destinations belong to the application.
- Tables and code scroll within their own regions. Images keep their aspect ratio and fit the available width; image loading follows the supplied URL.
- Choose headingOffset to place a document below the surrounding page heading. Native semantic levels are retained, capped at h6.
- Extend rendering with plugins and component overrides rather than post-processing the output. Overriding a heading level replaces envUI’s offset for that level, and overriding pre or code replaces CodeBlock. Other raw HTML stays ignored.
- Use MarkdownEditor for formatted prose, Textarea for plain text. The stored value remains an ordinary Markdown string; syntax stays visible while editing.
- Preview uses Markdown with envUI prose typography and CodeBlock's code-theme colors. The source control reuses Textarea geometry and states, including fixed or content sizing.
- Formatting and typing share bounded undo/redo history. <kbd>Ctrl</kbd> or <kbd>Cmd</kbd> with <kbd>B</kbd>, <kbd>I</kbd> and <kbd>K</kbd> apply enabled bold, italic and link commands. <kbd>Ctrl</kbd> or <kbd>Cmd</kbd> with <kbd>Z</kbd> undoes; with <kbd>Shift</kbd>+<kbd>Z</kbd> or <kbd>Y</kbd> it redoes. In the toolbar, <kbd>←</kbd> and <kbd>→</kbd> move between actions.
- The editor retains native selection, paste and composition. Formatting waits until composition ends; toolbar actions restore the selection to the source.
- Native forms submit the source even while Preview is visible. Uncontrolled form reset restores defaultValue; controlled reset retains value, so the application resets its own draft. Replacing the controlled document clears its editing history.
- Preview renders when first opened, then retains its mounted state while inactive. Write edits are parsed on the next preview activation; visible previews reflect current source and rendering options.
- maxLength constrains typing and formatting. disabled and readOnly prevent edits; validation, persistence and save/cancel actions belong to the application.
- Link insertion escapes saved labels and destinations. If the source changes while a picker is open, the insertion is rejected rather than overwriting newer text. Search, permissions and routes remain application responsibilities.

TypeScript declarations provide the complete public API.

## Related topics

- [Code](../components/code.md)
- [TextField](../components/text-field.md)
- [Typography](../foundations/typography.md)
- [Accessibility](../foundations/accessibility.md)
