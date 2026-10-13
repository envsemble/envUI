# Spacing & shape

## React usage

```tsx
import { Surface, Stack, Text } from '@envsemble/envui';

<Surface padding={5} render={<Stack gap={4} />}>
  <Text as="h2" variant="section-heading">
    Workspace
  </Text>
  <Text>Padding is inside the surface; gap is between its children.</Text>
</Surface>;
```

### Props & contracts

| Name              | Contract                                                                                            |
| ----------------- | --------------------------------------------------------------------------------------------------- |
| Spacing steps 1–9 | 0.25, 0.5, 0.75, 1, 1.5, 2, 2.5, 3 and 4 rem                                                        |
| Step 0            | Removes padding or gap where the component supports it                                              |
| Touch minimum     | 2.75 rem for coarse pointers; controls can grow with content                                        |
| Outer corners     | 1.75 rem for panes, cards and the outside of a row group                                            |
| Standard corners  | 0.5 rem for inner rows, important actions, toasts and chips                                         |
| Other shapes      | Fully rounded actions/navigation; icon-only actions keep their variant corners; 0.25 rem checkboxes |

### Tokens for application CSS

Inside a `Theme`, or a document root themed by `ThemePreferenceProvider`, these custom properties arrange the application's own frames with the components, for example an image thumbnail beside a file drop zone. They follow the theme and the reader's text size.

| Name                                                                      | Contract                                                                                  |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `--space-1` … `--space-9`                                                 | The spacing scale: 0.25, 0.5, 0.75, 1, 1.5, 2, 2.5, 3 and 4 rem                           |
| `--radius-standard`                                                       | 0.5 rem: inner rows, important actions, toasts, chips and small frames such as thumbnails |
| `--radius-surface`                                                        | 1.75 rem: panes, cards and the outside of a row group                                     |
| `--md-sys-shape-corner-large`                                             | 1 rem: text fields, tables and file drop zones                                            |
| `--md-sys-shape-corner-full`                                              | Fully rounded: pills such as buttons, navigation items, badges and counters               |
| `--md-sys-shape-corner-extra-small` … `--md-sys-shape-corner-extra-large` | The rest of the corner scale: 0.25, 0.5, 0.75 and 1.75 rem                                |
| `--control-height` / `--control-height-compact`                           | 2.5 and 2 rem, both 2.75 rem on coarse pointers: the heights of controls to line up with  |
| `--control-icon-size`                                                     | 1 rem: the icon size inside controls                                                      |

## Guidelines

- Use relative units and the shared spacing scale. The parent owns gaps; each component owns its internal padding.
- Theme supplies scoped border-box sizing. Text, controls and layout children shrink to their container; long labels wrap. Rem and em dimensions follow browser text settings without shrinking the whole interface on a phone.
- FeatureCard responds to its own width. Dialogs, selects and notification stacks fit the viewport; code, tables, toolbars and crowded connected controls scroll within their own regions.
- Applications own page grids, breakpoints and custom content. Use minmax(0, 1fr) for grid tracks, min-inline-size: 0 for flex children and max-inline-size: 100% for media. Avoid fixed pixel widths and heights; retain content-driven height and a viewport meta tag.
- Let text wrap and controls grow with content. The application chooses layout breakpoints; there is no separate mobile theme or component set.
- Text has no outer margins. Cards already space direct children; Stack and ActionGroup supply other layouts.
- Use component defaults for geometry. Choose Surface for a plain pane and Card for a content surface.
- Grouped rows keep large outside corners and compact inside joins. Their component page owns the complete row behavior.

TypeScript declarations provide the complete public API.

## Related topics

- [Stacks & action groups](../components/layout.md)
- [Surface](../components/surface.md)
- [Cards](../components/cards.md)
- [Grouped rows](../components/rows.md)
- [Composition & extension](../foundations/composition.md)
