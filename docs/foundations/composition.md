# Composition & extension

## Compose one root

[Surface](../components/surface.md) supplies fill, padding and corners; [Row](../components/row.md), [Column](../components/column.md) and [Grid](../components/grid.md) supply layout. `render` puts both on one element, with the semantic tag on the element it supplies. A custom render component passes native props, `className`, `style`, `children` and `ref` to its root.

```tsx
import { Surface, Column, Text } from '@envsemble/envui';

export function WorkspacePane() {
  return (
    <Surface background="default" padding={5} render={<Column render={<section />} gap={4} />}>
      <Text render={<h2 />} variant="title">
        Workspace
      </Text>
      <Text>Shared plans and notes for the project.</Text>
    </Surface>
  );
}
```

## Create a product component

Wrap public components to give them product meaning, and spread the rest of the props onto them, so `id`, `aria-*`, handlers and `ref` reach the element. Card keeps its appearance and spacing.

```tsx
import { Card, type CardContentProps } from '@envsemble/envui';

type ProjectSummaryProps = Omit<
  CardContentProps,
  'title' | 'description' | 'render' | 'children'
> & {
  title: string;
  description: string;
};

export function ProjectSummary({ title, description, ...props }: ProjectSummaryProps) {
  return <Card {...props} render={<article />} title={title} description={description} />;
}
```

## Style a component's parts

Props come first. Where CSS must adjust a component, it targets its parts, `env-<component>-<part>` such as `.env-card-header`, and its `data-*` states, such as `[data-tone='danger']`. Part classes and states are public and versioned; the manifest lists them, and `get_component` returns them. envUI's CSS is in the `env` cascade layer, so an application's rule wins without extra specificity.

```css
@layer app {
  .project-card .env-card-header {
    align-items: baseline;
  }
}
```

Set system tokens, such as `--env-space-4`, to change what every component takes from them. Component tokens, such as `--env-card-padding`, are each component's own and may change in any release: don't set or read them.

## Extend the shared library

What every application needs, a control's look or interaction, belongs in envUI as a variant, slot or component, built on its primitives and tokens; don't copy a component's styles.

TypeScript declarations provide the complete public API.

## Related topics

- [Surface](../components/surface.md)
- [Column](../components/column.md)
- [Row](../components/row.md)
- [Grid](../components/grid.md)
- [Card](../components/card.md)
- [Spacing & shape](../foundations/spacing.md)
- [Colors & themes](../foundations/colors.md)
