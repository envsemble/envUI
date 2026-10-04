# envUI · @envsemble/envui

envUI is envsemble’s internal component library for React 19 and current browsers. ESM and TypeScript declarations are included; components support server rendering.

## Install

Configure your project `.npmrc`:

```ini
@envsemble:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

Use a GitHub classic token with `read:packages` and access to the private package. Keep the token in your shell/user configuration or CI secrets.

```sh
npm install @envsemble/envui react@^19 react-dom@^19
```

## Use

```tsx
import { Theme, Button, ActionGroup } from '@envsemble/envui';
import { Add } from '@envsemble/envui/icons/Add';
import { ChevronRight } from '@envsemble/envui/icons/ChevronRight';
import '@envsemble/envui/styles.css';

export function App() {
  return (
    <Theme theme="light">
      <ActionGroup>
        <Button startIcon={<Add />}>Create item</Button>
        <Button variant="secondary" iconOnly icon={<ChevronRight />} aria-label="Next item" />
      </ActionGroup>
    </Theme>
  );
}
```

The stylesheet bundles Inter and scopes styling to explicit light/dark theme boundaries. Your app owns theme preference, routing, data and validation. Dialogs, selects and managed notifications retain their originating theme through portals.

Code and Markdown use the optional content entry, with the same stylesheet:

```tsx
import { Code, CodeBlock, Markdown, MarkdownEditor } from '@envsemble/envui/content';
```

Basic UI imports exclude parsing and highlighting dependencies. Content highlighting starts lazily; inline code and code blocks use unmodified GitHub Dark Default colors in both app themes. CodeBlock supports an explicit light or dark override.

## Composition

- Use `Stack` for related blocks and `ActionGroup` for actions. Their `as` prop preserves semantic container tags. Stack also supports `render` to compose layout onto another root.
- Use `Surface` for a plain background pane. It owns a palette tone, padding and corners; layout and behavior stay with the contents. `render={<Stack />}` combines them without an extra wrapper.
- Use `Text` for the shared typography variants and semantic colors. It adds no outer margins.
- `Button href` renders a native link; omit `href` for a native button.
- `Button variant="text"` is a blue text action with no fill or border. Set `underline` to add an underline (off by default). It supports the same icons, disabled state and native link behavior; hover and pressed text colors follow the shared HSL rule.
- Use `Link href="..."` for links inside prose. It inherits the surrounding typography and defaults to an underline; set `underline={false}` to remove it. Link builds on the text Button and shares its colors, focus and disabled behavior. Markdown uses Link by default.
- Every Button variant supports `iconOnly` with `icon` and a required `aria-label`. `IconButton` is a shorthand with secondary as its default variant.
- Use `ButtonGroup` for connected horizontal rows or `orientation="vertical"` columns. Mix Button and IconButton variants freely; outer corners follow each button and adjoining corners use the row inner radius.
- `Card` builds on Surface and Stack. Use `href` for a destination, `as="button"` for an action, or `heading`, `meta` and `actions` for content with an action strip. `ClickableCard` and `ActionCard` remain compatibility wrappers; FeatureCard adds its specific layout.
- `Input` and `Textarea` default to outlined fields whose single thin border turns blue on hover and focus in both themes. Hover and pressed colors derive from the shared HSL rule, including while focused; backgrounds stay unchanged and invalid borders change shade within red. `variant="plain"` removes the border and fill, showing an underline on hover or focus, or a red underline when invalid. Both retain floating labels and linked recovery text. MarkdownEditor supports the same variants. `Select` shares the red error border, interaction shades and accessible hints/errors. Validation stays in the application.
- Outlined `Textarea` shares Input’s 1 rem corners. `sizing="fixed"` (default) scrolls and resizes from the full bottom edge, with no corner grip. The edge shares the field’s hover, focus, error and dragging colors. Focus the edge for Up/Down, Shift+Up/Down and Home keyboard controls. `sizing="content"` grows and shrinks automatically, with `rows` as a minimum. MarkdownEditor supports the same sizing modes.
- `Markdown` renders CommonMark/GFM with shared prose typography. `Code` handles inline source; `CodeBlock` defaults to GitHub Dark Default in both app themes, with optional copying and a code-theme override. Highlighting is lazy and bundled for offline use.
- `MarkdownEditor` adds formatting, shared undo/redo and Write/Preview to the native textarea. Applications own drafts, saving and resource pickers; inserted references remain ordinary Markdown links.
- `Tabs renderList` wraps the supplied tab list in a custom layout, such as a Card with a heading. Render the list once; panels remain outside that wrapper.
- `ToastProvider visibleLimit` caps each notification stack (default 3). New notices appear immediately, entering from the bottom at bottom-right or the top at top-center; older notices hide behind a count above the stack and reappear as space opens. Set `useToast().show({ message, duration })` in visible milliseconds, or use `Infinity` (also `0`) to persist until dismissed. Explicit durations apply to every variant, including notices with actions. Without a duration, errors and action notices persist; other notices last 5 seconds. Returning from overflow restarts the full duration. Hover or keyboard focus pauses only that notice; F6 viewport focus and an inactive window pause visible timers. Persistent notices do not pause other notices.

## Icons and assets

Prefer individual icon paths such as `@envsemble/envui/icons/Add` so development tooling loads only the symbols you use. Explicit imports from the `@envsemble/envui/icons` barrel remain supported and production bundles exclude unused icons. Both cover the complete pinned official Material Symbols Rounded catalogue. NavigationItem and Tabs automatically fill selected symbols and outline unselected ones. Standalone symbols accept `filled`; NavigationItem accepts an optional `selectedIcon` for custom React icons. No remote font or SVG loader is needed.

`EnvUILogo` renders the envUI lockup; `BrandLogo` renders the shared envsemble lockup. Both inherit their context color. Raw envUI logos and favicons are exported under `@envsemble/envui/assets/envUI/`; the common envsemble SVG and Inter font remain at `@envsemble/envui/assets/envsemble-lockup-black.svg` and `@envsemble/envui/assets/Inter.woff2`.

## Reference

Read [USAGE.md](USAGE.md) for component composition and state contracts; TypeScript declarations provide the full API. The matching release includes `envUI.html`, which opens offline. See the repository README for local live development and release instructions.

This is private envsemble software. Third-party licenses are in `licenses/` and [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
