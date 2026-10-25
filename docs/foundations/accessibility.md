# Accessibility

## React usage

```tsx
import { Column, IconButton, TextField } from '@envsemble/envui';
import { ChevronRight } from '@envsemble/envui/icons/ChevronRight';

<Column gap={4}>
  <TextField label="Project name" description="Visible labels stay while people type." />
  <IconButton icon={<ChevronRight />} aria-label="Next project" />
</Column>;
```

### Props & contracts

| Name           | Contract                                                                                                                                   |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| envUI provides | Native control semantics, connected field guidance, keyboard behaviour, modal focus and announcements; each component's page lists its own |
| You provide    | Labels and icon action names, headings, reading order, validation messages and recovery actions                                            |
| Focus          | Text fields recolor their border; other controls take the shared 0.125 rem ring                                                            |
| Contrast       | The contrast gate measures every pair a component paints in all four themes: 4.5:1 for text, 3:1 for boundaries, 7:1 at high contrast      |
| Reduced motion | `prefers-reduced-motion` keeps only opacity changes; spinners turn slowly                                                                  |
| Forced colors  | States a fill or shadow carried take system colors, such as Highlight and GrayText; swatches and heatmaps keep theirs                      |
| Touch          | Under a coarse pointer, controls and rows grow to at least 44 px; see [Touch](../foundations/spacing.md#touch)                             |
| Motion tokens  | `--env-motion-duration-fast`, `--env-motion-duration-medium` and `--env-motion-ease`, for the application's own transitions                |

## The words people use

The Site's Accessibility page is a short promise: what every component does, and what an application still supplies. Its phrases map to code here:

| Words on the Site        | What it means in code                                                                                             |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| Keyboard                 | Nothing to do in envUI's components; keep the DOM order the same as the visible order in your own layout          |
| Visible focus            | Nothing to do; don't remove the focus ring or `outline` in application CSS                                        |
| Screen readers           | Native elements and ARIA in every component; give each the name only the application knows                        |
| Contrast                 | Measured for envUI's own colors; check colors you set yourself, as [Customize and extend](../customizing.md) says |
| Reduced motion           | Built in; use the motion tokens in your own animations and keep only opacity under `prefers-reduced-motion`       |
| Forced colors            | Built in; use system colors under `forced-colors: active` in your own CSS                                         |
| Touch                    | Built in; grow your own targets as [Touch](../foundations/spacing.md#touch) shows                                 |
| Labels; Name this button | `label` on every field, and `aria-label` on IconButton and on every control without visible text                  |
| Text for pictures        | `alt` on meaningful images, `alt=""` on decorative ones                                                           |
| Headings                 | `render={<h2 />}` and so on, in order, on Text; a variant for the look, the element for the level                 |
| Error messages           | `error` on the field, a sentence that says what went wrong and how to put it right                                |
| Keyboard order           | The DOM order; never a positive `tabIndex`                                                                        |
| High contrast            | `contrast="high"` on Theme, or `system`, the default, which follows `prefers-contrast: more`                      |
| Respect reduced motion   | `@media (prefers-reduced-motion: reduce)` around the application's own movement                                   |

## Guidelines

- Keep the focus indicator visible, and the keyboard order the same as the visible layout.
- Respect reduced motion in the application's own animations, with the `--env-motion-*` tokens.
- Check the application's own content and contrast in both themes.

TypeScript declarations provide the complete public API.

## Related topics

- [TextField](../components/text-field.md)
- [Select](../components/select.md)
- [Tabs](../components/tabs.md)
- [Dialog](../components/dialog.md)
- [Toast](../components/toast.md)
- [Colors & themes](../foundations/colors.md)
