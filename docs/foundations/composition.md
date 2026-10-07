# Composition & extension

## Build from existing primitives

Surface supplies fill, padding and corners. Stack supplies layout. Card combines those layers with standard content spacing. Specialized cards reuse Card.

Use component props and slots for variations. Keep product data, routing and validation in the application.

## Compose one root

render lets Surface and Stack share one element. Put the semantic tag on the supplied element. A custom render component must pass native props, className, style, children and ref to its root.

Compose surface and layout behavior on one section. Place it inside the application’s Theme boundary.

```tsx
import { Surface, Stack, Text } from '@envsemble/envui';

export function WorkspacePane() {
  return (
    <Surface tone="pane" padding={5} render={<Stack as="section" gap={4} />}>
      <Text as="h2" variant="section-heading">
        Workspace
      </Text>
      <Text>Shared plans and notes for the project.</Text>
    </Surface>
  );
}
```

## Create a product component

Wrap public components to attach product meaning. Forward native props and refs so consumers retain accessible attributes and ordinary element behavior. React 19 passes ref as a prop.

ProjectSummary adds product content while Card continues to own its appearance and spacing.

```tsx
import type { ComponentPropsWithRef } from 'react';
import { Card, Text } from '@envsemble/envui';

type ProjectSummaryProps = Omit<ComponentPropsWithRef<'article'>, 'title' | 'children'> & {
  title: string;
  description: string;
};

export function ProjectSummary({ title, description, ...props }: ProjectSummaryProps) {
  return (
    <Card as="article" {...props}>
      <Text as="h3" variant="section-heading">
        {title}
      </Text>
      <Text tone="muted">{description}</Text>
    </Card>
  );
}
```

## Extend the shared library

When the same visual behavior is needed across products, add a shared variant, slot or component to envUI. Build on its existing primitives and central tokens, and document the public API.

Application CSS can arrange components in a page. Changes to control appearance or interaction belong in the library. Avoid targeting private envUI markup or copying its component styles.

Use the existing light and dark themes. Add intentional base colors centrally; interaction colors continue to follow the shared rule.

TypeScript declarations provide the complete public API.

## Related topics

- [Surface](../components/surface.md)
- [Stacks & action groups](../components/layout.md)
- [Cards](../components/cards.md)
- [Spacing & shape](../foundations/spacing.md)
- [Colors & themes](../foundations/colors.md)
