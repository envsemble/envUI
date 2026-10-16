# Surface

## React usage

```tsx
import { Surface, Stack, Text } from '@envsemble/envui';

<Surface tone="pane" padding={5} render={<Stack as="section" gap={5} />}>
  <Text as="h2" variant="section-heading">
    Workspace pane
  </Text>
  <Text tone="muted">Stack supplies the content layout on the same root.</Text>
</Surface>;
```

### Props & contracts

| Name                 | Contract                                                                             |
| -------------------- | ------------------------------------------------------------------------------------ |
| tone                 | pane (default), row, canvas or alternate                                             |
| padding              | Spacing step 0–9; omitted uses responsive 1–1.5 rem padding                          |
| corners              | surface (default, 1.75 rem), standard (0.5 rem), pill or none                        |
| density              | compact gives controls inside the compact control height; nested content inherits it |
| as                   | Native container tag; div by default, with the semantic tags supported by Stack      |
| render               | Optional root composition; set the tag on the supplied element instead of as         |
| Native element props | children, ref, className, style and accessible attributes                            |

## Guidelines

- Surface supplies fill, padding and corners without layout, gaps, margins or interaction.
- Use Surface for plain panes, Card for content surfaces with standard layout, and specialized cards for their specific composition. Card builds on Surface.
- Stack and ActionGroup own layout. Compose Stack through render when the surface itself should arrange its content.
- Use compact density for toolbars that float over dense content, such as a diagram canvas. Buttons, icon buttons and fields inside take the 2 rem compact height, which grows to the touch height on coarse pointers.
- Use surface corners for ordinary panes; standard and pill shapes serve the documented compact controls and rails. Custom render components must forward native props and refs.

TypeScript declarations provide the complete public API.

## Related topics

- [Spacing & shape](../foundations/spacing.md)
- [Stack](../components/stack.md)
- [Card](../components/card.md)
- [Colors & themes](../foundations/colors.md)
