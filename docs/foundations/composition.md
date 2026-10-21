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
    <Surface background="default" padding={5} render={<Stack render={<section />} gap={4} />}>
      <Text render={<h2 />} variant="title">
        Workspace
      </Text>
      <Text>Shared plans and notes for the project.</Text>
    </Surface>
  );
}
```

## Create a product component

Wrap public components to attach product meaning. Forward native props and refs so consumers retain accessible attributes and ordinary element behavior. React 19 passes ref as a prop.

ProjectSummary adds product content while Card continues to own its appearance and spacing. It takes Card's content props, less the ones it sets itself, and spreads the rest onto Card, so `id`, `aria-*` attributes, handlers and `ref` reach the element.

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

Props come first. Where an application's CSS must adjust a component, it targets the component's parts: every part has a class, `env-<component>-<part>`, such as `.env-card-header`, and a component shows its state in `data-*` attributes, such as `[data-tone='danger']` on an Alert. Part classes and state attributes are public and versioned: a release that renames or removes one is a major release, with a migration note. The manifest lists each component's parts with what each one is, and `get_component` returns them.

```css
@layer app {
  .project-card .env-card-header {
    align-items: baseline;
  }
}
```

Set the system tokens, such as `--env-color-bg-muted` or `--env-space-4`, to change what every component takes from them. Component tokens, the custom properties a component declares for itself, such as `--env-card-padding` or `--env-badge-fill`, are the component's own business and may change in any release: don't set or read them. envUI's CSS is in the `env` cascade layer, so an application's rule wins without extra specificity or `!important`.

## Extend the shared library

When the same visual behavior is needed across products, add a shared variant, slot or component to envUI. Build on its existing primitives and central tokens, and document the public API.

Application CSS can arrange components in a page and adjust their parts. Changes that every application needs, to a control's appearance or interaction, belong in the library. Avoid copying a component's styles.

Use the existing light and dark themes. Add intentional base colors centrally; interaction colors continue to follow the shared rule.

TypeScript declarations provide the complete public API.

## Related topics

- [Surface](../components/surface.md)
- [Stack](../components/stack.md)
- [Card](../components/card.md)
- [Spacing & shape](../foundations/spacing.md)
- [Colors & themes](../foundations/colors.md)
