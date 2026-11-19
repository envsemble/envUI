# @envsemble/eslint-plugin-envui

ESLint rules for applications built with envUI. Each reports what envUI already provides but the code builds by hand, and its message says what to write instead and how to import it. Every rule is an error. The [Stylelint config](https://github.com/envsemble/envUI/tree/main/packages/stylelint-config) does the same for style sheets.

## Install

Install the version of `@envsemble/envui` you use; the rules know that release's components. It needs ESLint 10 and its flat config.

```sh
npm install --save-dev --save-exact @envsemble/eslint-plugin-envui@<the version of @envsemble/envui>
```

## Use

```js
// eslint.config.js
import { defineConfig } from 'eslint/config';
import envui from '@envsemble/eslint-plugin-envui';

export default defineConfig(envui.configs.recommended);
```

`configs.recommended` turns every rule on for `**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}`. TypeScript needs a parser such as typescript-eslint's; the rules need no type information. Code that draws its own controls on purpose, such as a canvas editor or an adapter for another library, turns a rule off by file:

```js
export default defineConfig(envui.configs.recommended, {
  files: ['src/editor/**'],
  rules: { 'envui/no-html-elements': 'off' },
});
```

`settings.envui.reexportModules` lists the application's modules that re-export envUI under envUI's names, such as `path.resolve(import.meta.dirname, 'src/ui')` or `'@/components/ui'`; names imported from them count as envUI's.

## Rules

### no-html-elements

A raw element or widget role that envUI has a component for, from the table in [`src/data/elements.json`](src/data/elements.json). A raw `<button>` with a written `type`, a text label and only attributes Button passes on is fixed to `Button`. What a part renders through `render`, Base UI's components (`@base-ui/react`) and a link adapter's own `<a>` pass. Options: `allow` (entries by id or element) and `renderProps` (default `['render']`).

```text
Use envUI's TextField instead of a raw <input type="email">: import { TextField } from '@envsemble/envui'. TextField takes the same type.
```

### no-raw-colors

A literal color in a JSX `style` object; tokens, `color-mix()` of tokens and relative colors from a token pass.

```text
Raw color #fff in an inline style: use an envUI color token instead, such as var(--env-color-fg-default) or another var(--env-color-fg-…) role, so the color follows the theme and keeps its contrast.
```

### no-raw-graphics

A remote or computed `<img>`, an `<svg>` with a fixed size or fill or another icon package's icon, such as lucide-react's, outside an icon slot or Graphic, and a Graphic without `alt` or with a negative margin, which makes up for a file's empty edges. Another package's icon in an icon slot or a Graphic, such as a brand mark Material Symbols lacks, passes, and so does a margin that spaces a Graphic. An `<img>` of the application's own image passes: a relative or root-relative `src`, such as `/brand/logo.svg`, or an imported image file. Option: `allow` (icon packages whose icons may render anywhere).

```text
A raw <svg width="24" height="24"> takes its size from the file: pass it to an icon slot, such as IconButton's icon, or wrap it in envUI's <Graphic alt="">: import { Graphic } from '@envsemble/envui'.
```

### no-link-in-clickable-row

A link-styled action, a raw `<a>`, a `Link` or a `Button` with `variant="text"`, inside a `List.Item`, `Table.Row` or `Card` that takes the click itself, with `href` or `onClick`. A link in a List.Item's `start`, `end` or `control` passes, since those slots sit above the row's target, such as an Avatar that opens the person's profile. An `interactive` row's `data-row-target` passes, and so do its other links, which stay clickable above that target. An `interactive` Card with a `data-row-target` inside takes the click too: its target passes, and so do links in its `meta`, `end` and `actions`, which sit above it.

```text
A Button with variant="text" inside a clickable List.Item: the row takes the click. Move the action into its end slot as a Button, or into a Menu. When it goes where the row goes, mark it data-row-target instead.
```

### no-field-in-list-row

A field with no `label`, `aria-label` or `aria-labelledby`, such as a `Select`, `Combobox`, `TextField`, `SearchField`, `Textarea`, `SegmentedControl`, `Slider`, a `RadioGroup` or a picker, in a `List.Item`'s `control` or `end`, or a `Radio` with none in its `end`. The row's label names only a `Switch`, a `Checkbox` or a `Radio` in its `control`, so a field there or in `end` needs its own name. A labelled field, such as a settings row that ends in `<Select label="Theme" />`, passes, as does a form in an overlay the row opens, such as a `Popover`, `Dialog`, `Sheet` or `Menu`.

```text
A Select with no label in a List.Item's control: the row's label names only a Switch, a Checkbox or a Radio in its control, so nothing names this field. Give it a label, or an aria-label or aria-labelledby when its label shouldn't show.
```

### label-vocabulary

The label of an action, `Button`, `IconButton`, `ConfirmButton`, `CopyButton`, `Link` or `Menu.Item`, in its text or its `children`, `label`, `aria-label` or `…Label` prop, that is a word the vocabulary table of envUI's writing guide replaces, from [`src/data/vocabulary.json`](src/data/vocabulary.json). A label with more words, such as "Clone repository", passes. Option: `allow` (words the application keeps, such as `['Clone', 'Retry']` in a developer tool, in any case).

```text
Write "Edit" instead of "Modify".
```

## Development

```sh
npm test --workspace @envsemble/eslint-plugin-envui
npm run tokens:build    # rewrites src/data from the library, the writing guide and the token list
```
