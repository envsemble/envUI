# List

## React usage

```tsx
import { Button, IconButton, Link, List } from '@envsemble/envui';
import { MoreHoriz } from '@envsemble/envui/icons/MoreHoriz';

<List.Root>
  <List.Item
    title="Notifications"
    detail="Delivery preferences"
    action={<Button variant="outlined">Manage</Button>}
  />
  <List.Item title="Members" detail="Workspace access" />
</List.Root>;

<List.Root aria-label="Plans">
  <List.Item
    interactive
    title={
      <Link href="/plans/roadmap" underline={false} data-row-target draggable={false}>
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
</List.Root>;
```

```css
/* The row's other controls stay above the link that covers it. */
.plan-row-action {
  position: relative;
}
```

### Props & contracts

| Name                              | Contract                                                                                    |
| --------------------------------- | ------------------------------------------------------------------------------------------- |
| List.Root contrast                | Use alternate fill inside a muted pane                                                      |
| List.Item title / detail / action | General React content                                                                       |
| List.Item interactive             | Hover, press and keyboard focus feedback; a `data-row-target` link or button covers the row |
| Native container props            | className and accessible attributes                                                         |

## Guidelines

- One row uses the full 1.75 rem outer radius. Multiple rows keep large outer corners and 0.5 rem inner corners.
- Rows have a 3.5 rem minimum height and a 0.125 rem gap. In a muted pane, use contrast fill to distinguish the rows.
- Text keeps 1.5 rem from the row's edges, clear of the large corners, whether a row stands alone or is connected. Radio rows, select options and menu items share it.
- Keep actions short and let long titles and details wrap.
- Make a row interactive when it opens something through a link or button inside, such as a document from its title. Like a clickable card, it highlights on hover and while keyboard focus is inside it; links and buttons in its content do not also shrink as they are pressed. To open from anywhere on the row, mark that one link or button `data-row-target`: it covers the row, a press anywhere on the row follows it and darkens the row, and keyboard and screen reader users still meet a single link. Give it `draggable={false}` too, so that a press that moves a little opens it in every browser instead of dragging the link. Other links and buttons in the row take position: relative to stay above it, and so does anything whose own tooltip should show, since text under the target can't be selected and tooltips of what it covers don't show.

TypeScript declarations provide the complete public API.

## Related topics

- [Surface](../components/surface.md)
- [Card](../components/card.md)
- [Radio](../components/radio.md)
- [Select](../components/select.md)
- [Spacing & shape](../foundations/spacing.md)
