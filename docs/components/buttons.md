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
| variant             | primary (default), important, secondary, outlined, destructive, text              |
| underline           | Optional underline for text buttons and links; false by default                   |
| Link                | Inline native link with inherited typography; underline defaults to true          |
| startIcon / endIcon | Optional React content beside the label                                           |
| iconOnly / icon     | Show only the supplied icon; size is square and corners follow the chosen variant |
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
| aria-label          | Required accessible action name               |
| Native button props | disabled, type, onClick and ref               |

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

- Use one primary action in an action group. Reserve important emphasis for rare, consequential actions.
- Action buttons fit their content: 2.5 rem minimum height (2 rem for important), 0.875 rem text, 0.25 rem vertical and 0.75 rem horizontal padding. Labels wrap when space is limited.
- Use fully rounded corners; important actions use 0.5 rem corners. ActionGroup provides 1 rem row gaps or 0.5 rem stacked gaps.
- Use ButtonGroup for connected rows or columns: the gap is 0.125 rem and adjoining corners use the shared 0.5 rem row inner radius. Each end keeps its button variant’s outer corners; a single button keeps all its normal corners.
- Prefer the same button variant within a connected group. Mix variants when related actions need different emphasis.
- ButtonGroup accepts any mixture of labeled, icon-only, leading/trailing icon and native link buttons. Horizontal buttons share a height; vertical buttons fill the group width. Labels wrap, and groups scroll locally if their controls cannot fit. Hidden buttons do not determine the end corners.
- Give related actions an accessible group name. ButtonGroup retains ordinary Tab navigation and each button’s native activation, focus and disabled behavior.
- Secondary buttons use the neutral row fill and label color, without a border. Outlined buttons retain their border and link color.
- Text buttons use link blue with no fill, border or horizontal inset. Set underline to show an underline. Hover and pressed states change only the text color using the shared HSL rule. Use onClick for actions and href for navigation; keyboard focus and disabled behavior remain shared with Button.
- Interaction colors follow the central HSL lightness rule described in Colors & themes. State colors and disabled opacity come from the shared stylesheet.
- Use href for destinations and onClick for actions. Disabled links have no destination and cannot activate.
- Labeled and icon-only buttons share the 1 rem control icon size used by NavigationItem. Leading and trailing icons follow the same rule, including important buttons.
- Every variant supports iconOnly: a square matching its regular button height (2 rem for important; 2.5 rem for the others). Corners, colors, borders and interaction states follow the chosen variant: important is a rounded square; the others are circles. Name the action, rather than the icon shape.
- IconButton is a shorthand for Button with iconOnly enabled and variant="secondary" by default.

TypeScript declarations provide the complete public API.

## Related topics

- [Stacks & action groups](../components/layout.md)
- [Colors & themes](../foundations/colors.md)
- [Icons & assets](../foundations/icons.md)
- [Accessibility](../foundations/accessibility.md)
