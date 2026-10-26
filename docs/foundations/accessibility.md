---
title: Accessibility
summary: What every component does for keyboard, screen readers, contrast, motion and touch, and what an app still supplies.
aliases:
  - a11y
  - keyboard
  - screen reader
  - focus
  - contrast
  - high contrast
  - reduced motion
  - forced colors
  - accessible name
avoidWhen:
  - text: A field with a visible label, its description and its error.
    use: TextField
  - text: One choice of many, moved through with the keyboard.
    use: Select
  - text: Views moved between with the arrow keys.
    use: Tabs
  - text: A task that holds focus until people finish it.
    use: Dialog
  - text: A message announced without moving focus.
    use: Toast
  - text: Colors and their contrast in every theme.
    see: colors
examples:
  Keyboard:
    role: example
    caption: Tab moves forward and Shift+Tab back; Space checks the box and Enter presses a button.
---

# Accessibility

## Behaviour

### What every component does

Every envUI component works for everyone without extra work, and each component's page says what it does in detail.

- **Keyboard**: everything works from the keyboard, in the order it shows.
- **Visible focus**: a clear ring shows where the keyboard is.
- **Screen readers**: controls, regions and messages are announced by their name and state.
- **Contrast**: text, edges and focus are checked for contrast in all four themes.
- **Reduced motion**: when people ask for less motion, things fade instead of move.
- **Forced colors**: with the system's own high-contrast colors, every state stays visible.
- **Touch**: on a touchscreen, controls grow big enough for a finger.

### Try the keyboard

Press Tab to move into the example and through it, and watch the focus follow the keyboard in the order the controls show.

```tsx figure=Keyboard

```

### Try high contrast

Choose High under Contrast in the Display menu, at the top of the page, and every page here shows stronger text and edges.

## Rules

envUI can't know an app's own words: the app, or the agent that builds it, still supplies them.

- **Labels**: a visible label for every field, and a name for every button that is only an icon.
- **Text for pictures**: a description of every image that carries meaning.
- **Headings**: headings in order, so people can find their way around a page.
- **Error messages**: messages that say what went wrong and how to put it right.

## Words to use

Ask an agent for accessibility in these words; envUI does the rest in every component.

| Words                  | In code                                                                                          | Use for                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| Name this button       | `label` on every field, and `aria-label` on IconButton and on every control without visible text | Gives a button that is only an icon a name that screen readers say.                      |
| Keyboard order         | The DOM order; never a positive `tabIndex`                                                       | Puts controls in the order they show, so the keyboard moves through them as people read. |
| High contrast          | `contrast="high"` on Theme, or `system`, the default, which follows `prefers-contrast: more`     | Stronger text and edges, chosen by the reader or followed from their system.             |
| Respect reduced motion | `@media (prefers-reduced-motion: reduce)` around the application's own movement                  | Makes the app's own animations fade instead of move when people ask for less motion.     |

## Compose

### Usage

```tsx
import { Column, IconButton, TextField } from '@envsemble/envui';
import { ChevronRight } from '@envsemble/envui/icons/ChevronRight';

<Column gap={4}>
  <TextField label="Project name" description="Visible labels stay while people type." />
  <IconButton icon={<ChevronRight />} aria-label="Next project" />
</Column>;
```

| Name           | Takes                                                                                                                                      |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| envUI provides | Native control semantics, connected field guidance, keyboard behaviour, modal focus and announcements; each component's page lists its own |
| You provide    | Labels and icon action names, headings, reading order, validation messages and recovery actions                                            |
| Focus          | Text fields recolor their border; other controls take the shared 0.125 rem ring                                                            |
| Contrast       | The contrast gate measures every pair a component paints in all four themes: 4.5:1 for text, 3:1 for boundaries, 7:1 at high contrast      |
| Reduced motion | `prefers-reduced-motion` keeps only opacity changes; spinners turn slowly                                                                  |
| Forced colors  | States a fill or shadow carried take system colors, such as Highlight and GrayText; swatches and heatmaps keep theirs                      |
| Touch          | Under a coarse pointer, controls and rows grow to at least 44 px; as Touch on [Spacing & density](spacing.md) says                         |
| Motion tokens  | `--env-motion-duration-fast`, `--env-motion-duration-medium` and `--env-motion-ease`, for the application's own transitions                |

#### The words of the page

- **Keyboard**: nothing to do in envUI's components; keep the DOM order the same as the visible order in your own layout.
- **Visible focus**: nothing to do; don't remove the focus ring or `outline` in application CSS.
- **Screen readers**: native elements and ARIA in every component; give each the name only the application knows.
- **Contrast**: measured for envUI's own colors; check colors you set yourself, as [Customize and extend](../customizing.md) says.
- **Reduced motion**: built in; use the motion tokens in your own animations and keep only opacity under `prefers-reduced-motion`.
- **Forced colors**: built in; use system colors under `forced-colors: active` in your own CSS.
- **Touch**: built in; grow your own targets as Touch on [Spacing & density](spacing.md) shows.
- **Labels**: `label` on every field, and `aria-label` on IconButton and on every control without visible text.
- **Text for pictures**: `alt` on meaningful images, `alt=""` on decorative ones.
- **Headings**: `render={<h2 />}` and so on, in order, on Text; a variant for the look, the element for the level.
- **Error messages**: `error` on the field, a sentence that says what went wrong and how to put it right.

### Composition

- Keep the focus indicator visible, and the keyboard order the same as the visible layout.
- Respect reduced motion in the application's own animations, with the `--env-motion-*` tokens.
- Check the application's own content and contrast in both themes.

TypeScript declarations provide the complete public API.
