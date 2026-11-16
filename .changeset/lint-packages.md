---
'@envsemble/envui': minor
'@envsemble/eslint-plugin-envui': minor
'@envsemble/stylelint-config-envui': minor
---

The lint packages report only what is always wrong, every rule as an error, and each message says what to write instead and how to import it.

Breaking changes:

- ESLint: `envui/no-inline-layout` is removed; delete it from your configuration and from any disable comment.
- ESLint: `no-html-elements` messages no longer end with "propose an addition to envUI"; Base UI's components (`@base-ui/react`) are never reported, and `--fix` turns a raw `<button>` with a written `type`, a text label and only attributes Button passes on into `Button`, adding its import.
- ESLint: `no-raw-graphics` passes an `<img>` of the application's own image, a relative or root-relative `src` or an imported image file, such as a brand logo; remote and computed images are still reported.
- ESLint, new: `envui/no-link-in-clickable-row` reports a raw `<a>`, a `Link` or a `variant="text"` Button inside a `List.Item`, `Table.Row` or `Card` that takes the click itself; move the action into the row's `end` slot as a Button, or into a Menu.
- ESLint, new: `envui/no-field-in-list-row` reports a field, such as a `Select`, `TextField`, `SegmentedControl` or `Slider`, in a `List.Item`'s `control` or `end`: a list row holds a Switch, Checkbox or RadioGroup its label names, and a field goes in a form with its label above it.
- ESLint, new: `envui/label-vocabulary` reports the label of an action, such as a Button's text or a Menu.Item's `label`, that is a word the writing guide's vocabulary replaces, such as "Log in" (write "Sign in") or "Modify" (write "Edit"); the table qualifies the words that a label may rightly use, such as "Send" and "Next", and those pass.
- Stylelint: px is reported by `envui/no-px` instead of `unit-disallowed-list`; rename it in your overrides and disable comments. `--fix` writes rem at a 16px root, apart from hairlines of 1px or less.
- Stylelint, new: `envui/no-off-scale-values` reports a rem or px length in `gap`, `padding`, `margin`, `inset` or a border radius and names the step to write, such as `var(--env-space-2)` for `0.5rem`, or `var(--env-radius-full)` for a pill; other units pass.
- Stylelint, new: `envui/no-unknown-custom-properties` reports an `--env-*` name envUI doesn't define and names the nearest one; name the application's own properties outside `--env-`, such as `--app-…`.
- Stylelint, new: `envui/no-contrast-breaking-pairs` reports `color: var(--env-color-fg-on-X)` on a background that isn't an X fill, a text color token as a background, and a fill token as a text color.
- Stylelint, new: `envui/no-focus-outline-removal` reports `outline: none` or `outline: 0` on `:focus-visible` when nothing in the style sheet draws another ring.

The way to let code that draws its own controls through, such as a canvas editor or an adapter, is to turn a rule off for those files in the configuration.
