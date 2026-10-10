# Cards

## React usage

```tsx
import { Card, FeatureCard, Button, Text } from '@envsemble/envui';
import { Apps } from '@envsemble/envui/icons/Apps';

<Card href="/projects" aria-labelledby="projects-title">
  <Text as="h3" variant="section-heading" id="projects-title">Projects</Text>
  <Text>Open your shared workspace.</Text>
</Card>

<Card as="button" onClick={openProject}>
  <span>Open project</span>
</Card>

<FeatureCard icon={<Apps />} title="Connected workspace"
  description="Bring your team and tools together."
  action={<Button>Explore</Button>} />

<Card as="article" heading="Project overview" meta="Updated today"
  actions={<Button variant="outlined">Open project</Button>}>
  Shared project context.
</Card>
```

### Props & contracts

| Name                          | Contract                                                                                 |
| ----------------------------- | ---------------------------------------------------------------------------------------- |
| Card tone / padding           | row (default), pane or canvas; optional fixed spacing step 0–9                           |
| Card as / href                | div (default), article or button; href renders a native link                             |
| Card heading / meta / actions | Content-card slots; actions adds a footer strip                                          |
| Card layout                   | content (default) or action; actions automatically selects action layout                 |
| ClickableCard                 | Compatibility wrapper for Card href / Card as="button"; native action props and disabled |
| ActionCard                    | Compatibility wrapper for Card action layout; title maps to heading                      |
| FeatureCard                   | icon, title, description, action                                                         |

## Guidelines

- Use 1.75 rem corners. Row tone is the standalone card fill; pane tone groups content in a quieter background.
- Cards space direct children by 1 rem. FeatureCard keeps compact title/description spacing and separates additional content by 1 rem.
- Card composes Surface and Stack on one root and shares the selected Surface tone’s colors. FeatureCard, ActionCard and ClickableCard reuse that card implementation; child controls retain their Button colors.
- Use Card href for a single destination or Card as="button" for an action. Do not nest controls inside an interactive card. Use phrasing content such as spans in button cards.
- Interactive cards share the same surface, padding and corners. Hover and pressed derive from the chosen tone using gentle 2- and 4-point lightness shifts in both themes; keyboard focus and disabled behavior are shared. Label rich links with aria-labelledby and connect descriptions with aria-describedby.
- The action strip derives its fill from the parent surface. Compose actions from the shared controls.
- Titles, metadata and product data remain application content.

TypeScript declarations provide the complete public API.

## Related topics

- [Surface](../components/surface.md)
- [Stacks & action groups](../components/layout.md)
- [Grouped rows](../components/rows.md)
- [Typography](../foundations/typography.md)
