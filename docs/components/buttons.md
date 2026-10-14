# Buttons

## Button

```tsx
import { Button, Link } from '@envsemble/envui';
import { Add } from '@envsemble/envui/icons/Add';

<Button variant="primary" startIcon={<Add />} onClick={createItem}>
  Create item
</Button>

<Button iconOnly icon={<Add />} aria-label="Create item" onClick={createItem} />

<Button href="/projects" variant="outlined">Open projects</Button>

<Button variant="text" onClick={showDetails}>View details</Button>
<Button variant="text" href="/help" underline>Read help</Button>

<Link href="/help">Read help within a paragraph</Link>
<Link href="/help" underline={false}>Read help without an underline</Link>
```

### Props & contracts

| Name                | Contract                                                                          |
| ------------------- | --------------------------------------------------------------------------------- |
| variant             | primary (default), important, secondary, outlined, destructive, text or quiet     |
| underline           | Optional underline for text buttons and links; false by default                   |
| Link                | Inline native link with inherited typography; underline defaults to true          |
| startIcon / endIcon | Optional React content beside the label                                           |
| iconOnly / icon     | Show only the supplied icon; size is square and corners follow the chosen variant |
| pending             | A spinner replaces the content at the same size; busy, and activation is ignored  |
| aria-label          | Required accessible action name when iconOnly is true                             |
| href                | Render a native link with the same button appearance; omit for a native button    |
| Native action props | disabled, type/onClick or anchor attributes, ref and accessible attributes        |

## IconButton

```tsx
import { IconButton } from '@envsemble/envui';
import { ChevronRight } from '@envsemble/envui/icons/ChevronRight';

<IconButton icon={<ChevronRight />} aria-label="Next item" onClick={next} />;
```

### Props & contracts

| Name                | Contract                                      |
| ------------------- | --------------------------------------------- |
| icon                | React icon content                            |
| variant             | Same variants as Button; secondary by default |
| pending             | A spinner replaces the icon while work runs   |
| aria-label          | Required accessible action name               |
| Native button props | disabled, type, onClick and ref               |

## ConfirmButton

```tsx
import { ConfirmButton } from '@envsemble/envui';
import { Delete } from '@envsemble/envui/icons/Delete';

<ConfirmButton confirmLabel="Remove Morgan?" onConfirm={() => removeSeat(morgan)}>
  Remove
</ConfirmButton>

<ConfirmButton
  variant="destructive"
  confirmLabel="Cancel plan · 3 lose access"
  pending={cancelling}
  onConfirm={cancelPlan}
>
  Cancel plan
</ConfirmButton>

<ConfirmButton
  icon={<Delete />}
  aria-label="Delete draft"
  confirmLabel="Delete draft?"
  onConfirm={deleteDraft}
/>
```

### Props & contracts

| Name                | Contract                                                                                                      |
| ------------------- | ------------------------------------------------------------------------------------------------------------- |
| confirmLabel        | The label while armed, naming what a second press does                                                        |
| onConfirm           | Runs on the second press                                                                                      |
| variant             | outlined (default; secondary when icon-only), secondary, destructive or text at rest; armed it is destructive |
| armedDuration       | Milliseconds the button stays armed without a second press; 4000 by default                                   |
| icon / aria-label   | A round icon-only button at rest, named by aria-label; armed, it shows the icon with the confirm label        |
| pending / disabled  | End an arming; pending shows the spinner as on Button                                                         |
| Native button props | ref, onBlur, onKeyDown and accessible attributes                                                              |

## CopyButton

```tsx
import { CopyButton } from '@envsemble/envui';

<CopyButton value={shareUrl} aria-label="Copy link" />

<CopyButton value={() => report.id} variant="outlined" onCopy={(text) => remember(text)}>
  Copy ID
</CopyButton>

<CopyButton value={createShareLink} aria-label="Copy share link" size="compact" variant="text" />
```

### Props & contracts

| Name                      | Contract                                                                                             |
| ------------------------- | ---------------------------------------------------------------------------------------------------- |
| value                     | The text to copy, or a function that returns it, also as a promise, when the button is pressed       |
| aria-label                | Required without visible children: what it copies, such as Copy link; also its tooltip at rest       |
| children                  | A visible label after the copy icon; aria-label is then optional                                     |
| onCopy                    | Runs once the text is on the clipboard, with that text                                               |
| variant                   | As Button; secondary by default, like IconButton                                                     |
| size                      | standard (default) takes the surrounding density; compact is the 2 rem compact height anywhere       |
| icon                      | The icon at rest; ContentCopy by default                                                             |
| copiedLabel / failedLabel | The result in the tooltip and the announcement; Copied and Couldn’t copy by default                  |
| Native button props       | ref, disabled and accessible attributes; onClick runs first, and preventDefault there skips the copy |

## ButtonGroup

```tsx
import { Button, ButtonGroup, IconButton } from '@envsemble/envui';
import { Settings } from '@envsemble/envui/icons/Settings';

<ButtonGroup aria-label="Project actions">
  <Button variant="secondary">Open</Button>
  <IconButton icon={<Settings />} aria-label="Settings" />
  <Button variant="secondary">Close</Button>
</ButtonGroup>

<ButtonGroup orientation="vertical" aria-label="Item actions">
  <Button startIcon={<Settings />} variant="outlined">Manage</Button>
  <Button href="/projects" variant="outlined">Open projects</Button>
  <Button variant="outlined">Settings</Button>
</ButtonGroup>
```

### Props & contracts

| Name                         | Contract                                                                           |
| ---------------------------- | ---------------------------------------------------------------------------------- |
| orientation                  | horizontal (default) or vertical                                                   |
| children                     | Direct Button or IconButton children; all variants and native button links can mix |
| aria-label / aria-labelledby | Accessible name for the related actions                                            |
| Native div props             | ref, className, style, role and accessible attributes; role defaults to group      |

## Guidelines

- Say what an action will do before it is taken. When the outcome is known, put it in the label, such as “Show 128 homes”, “Switch to Team · +5 seats” or “Assign to Morgan”. Use AnimatedNumber for a count that changes while choices are made.
- Use ConfirmButton for an action that takes effect at once and cannot be undone, such as removing someone's access. The first press names the consequence in place and announces it; a double click only arms it; <kbd>Esc</kbd>, leaving the button and four seconds disarm it. Use a Dialog when the person must choose or type something first. An icon-only ConfirmButton, such as a delete icon in a dense row, is round like IconButton until it is armed; then it grows to show the confirm label beside its icon, so the consequence is still named, and keeps focus.
- Use CopyButton beside a value people paste elsewhere, such as a link, an ID or a command, and name it after what it copies. A press writes the text with the asynchronous Clipboard API; where the page has no clipboard access, such as without a secure connection, it copies a selection of a hidden field beside the button instead, also inside a dialog, and gives focus back. A function value runs at the press, so the text is current; a promise keeps the button pending until it resolves, and browsers that allow writing only during the press receive it as it arrives.
- After a press the icon turns into a check, and Copied shows in the tooltip for about two seconds, also when the pointer has left; Couldn’t copy shows when nothing could be copied. <kbd>Esc</kbd> hides it. A visually hidden status announces the same words, again for each press, while the button keeps its name and focus. An icon-only CopyButton shows its name in the tooltip on hover and keyboard focus, also while disabled, through a focusable target around it, as Tooltip does; inside an application Tooltip that tooltip describes it, and the check and the announcement report the result.
- CopyButton is as large as IconButton and Button: 2.5 rem, and 2 rem in a compact surface or with size="compact"; both grow to 2.75 rem on touch screens.
- Use one primary action in an action group. Reserve important emphasis for rare, consequential actions.
- Action buttons fit their content: 2.5 rem minimum height (2 rem for important), 0.875 rem text, 0.25 rem vertical and 0.75 rem horizontal padding. Labels wrap when space is limited.
- Use fully rounded corners; important actions use 0.5 rem corners. ActionGroup provides 1 rem row gaps or 0.5 rem stacked gaps.
- Use ButtonGroup for connected rows or columns: the gap is 0.125 rem and adjoining corners use the shared 0.5 rem row inner radius. Each end keeps its button variant’s outer corners; a single button keeps all its normal corners.
- Prefer the same button variant within a connected group. Mix variants when related actions need different emphasis.
- ButtonGroup accepts any mixture of labeled, icon-only, leading/trailing icon and native link buttons. Horizontal buttons share a height; vertical buttons fill the group width. Labels wrap, and groups scroll locally if their controls cannot fit. Hidden buttons do not determine the end corners.
- Give related actions an accessible group name. ButtonGroup retains ordinary <kbd>Tab</kbd> navigation and each button’s native activation, focus and disabled behavior.
- Secondary buttons use the neutral row fill and label color, without a border. On row fills (grouped rows, row-tone cards and card action strips) they shift from that fill by the control lightness rule, so they stay visible. Outlined buttons retain their border and link color.
- Quiet buttons are for actions in an application's chrome, such as a sidebar toggle or the actions of a toolbar or a section inside a surface. The icon, or label, takes the quiet icon color, darkens to the text color over a state layer on hover and press, and shows the shared focus ring, in both themes; there is no fill or border. Use IconButton with variant="quiet" for an icon-only one, and Button for one with a label, which reads at 4.5:1 on the canvas, panes and rows.
- Text buttons use link blue with no fill, border or horizontal inset. Set underline to show an underline. Hover and pressed states change only the text color using the shared HSL rule. Use onClick for actions and href for navigation; keyboard focus and disabled behavior remain shared with Button.
- Interaction colors follow the central HSL lightness rule described in Colors & themes. State colors and disabled opacity come from the shared stylesheet.
- Use href for destinations and onClick for actions. Disabled links have no destination and cannot activate.
- Icon-only buttons keep their square size wherever they sit, also in a squeezed flex row; labeled buttons can shrink and wrap their labels.
- Labeled and icon-only buttons share the 1 rem control icon size used by NavigationItem. Leading and trailing icons follow the same rule, including important buttons.
- Every variant supports iconOnly: a square matching its regular button height (2 rem for important; 2.5 rem for the others). Corners, colors, borders and interaction states follow the chosen variant: important is a rounded square; the others are circles. Name the action, rather than the icon shape.
- IconButton is a shorthand for Button with iconOnly enabled and variant="secondary" by default.

TypeScript declarations provide the complete public API.

## Related topics

- [Stacks & action groups](../components/layout.md)
- [Animated numbers](../components/animated-number.md)
- [Colors & themes](../foundations/colors.md)
- [Icons & assets](../foundations/icons.md)
- [Accessibility](../foundations/accessibility.md)
