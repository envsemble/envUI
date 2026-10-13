# Grouped rows

## React usage

```tsx
import { Button, GroupedRows, IconButton, Link, Row } from '@envsemble/envui';
import { MoreHoriz } from '@envsemble/envui/icons/MoreHoriz';

<GroupedRows>
  <Row
    title="Notifications"
    detail="Delivery preferences"
    action={<Button variant="outlined">Manage</Button>}
  />
  <Row title="Members" detail="Workspace access" />
</GroupedRows>;

<GroupedRows aria-label="Plans">
  <Row
    interactive
    title={
      <Link href="/plans/roadmap" underline={false} className="plan-row-link">
        Roadmap
      </Link>
    }
    detail="Updated today"
    action={
      <IconButton
        variant="text"
        icon={<MoreHoriz />}
        aria-label="More actions"
        className="plan-row-action"
      />
    }
  />
</GroupedRows>;
```

```css
/* The link covers its row, so a press anywhere on the row follows it; other controls stay above. */
.plan-row-link::after {
  content: '';
  position: absolute;
  inset: 0;
}
.plan-row-action {
  position: relative;
}
```

### Props & contracts

| Name                        | Contract                               |
| --------------------------- | -------------------------------------- |
| GroupedRows contrast        | Use alternate fill inside a muted pane |
| Row title / detail / action | General React content                  |
| Row interactive             | Hover, press and focus-within feedback |
| Native container props      | className and accessible attributes    |

## Guidelines

- One row uses the full 1.75 rem outer radius. Multiple rows keep large outer corners and 0.5 rem inner corners.
- Rows have a 3.5 rem minimum height and a 0.125 rem gap. In a muted pane, use contrast fill to distinguish the rows.
- Text keeps 1.5 rem from the row's edges, clear of the large corners, whether a row stands alone or is connected. Radio rows, select options and menu items share it.
- Keep actions short and let long titles and details wrap.
- Make a row interactive when it opens something through a link or button inside, such as a document from its title. Like a clickable card, it highlights on hover and while pressed, and while focus is inside it; links and buttons in its content do not also shrink as they are pressed. To open from anywhere on the row, stretch that one link over it: the row is the link's containing block, so a pseudo-element with position: absolute and inset: 0 covers it, and keyboard and screen reader users still meet a single link. Other links and buttons in the row take position: relative to stay above it. Text under the stretched link can't be selected, and tooltips of what it covers don't show.

TypeScript declarations provide the complete public API.

## Related topics

- [Surface](../components/surface.md)
- [Cards](../components/cards.md)
- [Radio groups](../components/radio.md)
- [Selects](../components/select.md)
- [Spacing & shape](../foundations/spacing.md)
