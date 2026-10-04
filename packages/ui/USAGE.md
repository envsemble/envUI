# @envsemble/envui usage

React 19 components for current browsers. Import the public package API and one stylesheet. Theme preference, routing, validation and product data belong to the application.

## Install

Configure private GitHub Packages access using an environment token with read:packages and package access. Keep credentials outside committed files.

```ini
# Project .npmrc
@envsemble:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

```sh
npm install @envsemble/envui react@^19 react-dom@^19
```

## First component

```tsx
import { Theme, Button } from '@envsemble/envui';
import { Add } from '@envsemble/envui/icons/Add';
import '@envsemble/envui/styles.css';

export function App() {
  return <Theme theme="light">
    <Button startIcon={<Add />}>Create item</Button>
  </Theme>;
}
```

Use Theme theme="light" or theme="dark". Inter, tokens and assets are included. Prefer explicit per-icon imports such as @envsemble/envui/icons/Add to keep development tooling from loading the complete catalogue; the @envsemble/envui/icons barrel remains supported. Icons accept filled, width, height and accessible SVG attributes. Components accept custom React icon content.

## Foundations

### Colors & themes

#### React usage

```tsx
import { Theme, Text, useTheme } from '@envsemble/envui';
import '@envsemble/envui/styles.css';

function ThemeLabel() {
  const theme = useTheme();
  return <Text>Current theme: {theme}</Text>;
}

<Theme theme="dark"><ThemeLabel /></Theme>
```

- Theme theme: Required: light or dark; scopes tokens and provides React theme context
- Theme native props: children, ref, className, style and native div attributes
- useTheme(): Returns the current theme, including across library portals
- Theme preference: The application owns selection, persistence and system preference

#### Guidelines

- Use palette base colors. Derive states centrally; do not add separate hover or pressed palette entries.
- Below 50% HSL lightness, add lightness; otherwise subtract it. Hover shifts 10 points, press shifts 20, and results clamp to 0–100%. Disabled opacity is 0.48.
- Matching colors share a hue across themes. Saturation and lightness may differ; distinct semantic exceptions retain their own hues. Focus uses text color in light and link color in dark.
- Selected navigation mixes 13% link color with its surface. Card action strips mix 35% muted surface with the parent surface.
- Scope content with Theme. Nested boundaries and portaled components retain the originating theme.

Related: [Surface](#surface), [Buttons](#buttons), [Navigation items](#navigation-items), [Accessibility](#accessibility).

### Typography

#### React usage

```tsx
import { Text, Stack } from '@envsemble/envui';

<Stack>
  <Text as="h1" variant="page-heading">Project overview</Text>
  <Text as="h2" variant="section-heading">Project details</Text>
  <Text>Shared context for your team.</Text>
  <Text variant="supporting">Notes for the project.</Text>
  <Text variant="caption">Updated today</Text>
</Stack>

<Stack>
  <Text as="h3" variant="page-heading">Project overview</Text>
  <Text tone="muted">Shared project context.</Text>
  <Text tone="quiet">Updated today.</Text>
  <Text>Project status: <Text as="span" tone="muted">Draft</Text></Text>
</Stack>
```

- Text variant: body (default), page-heading, section-heading, supporting or caption
- Text tone: Optional primary, muted or quiet override of the variant’s default color
- Text as: Native text tag; p (default), span, small, strong or h1–h6
- Native element props: children, ref, className and accessible attributes

#### Guidelines

- Use Inter at regular (400) or medium (500) weight, with 1.4 line height. The preview orders styles by emphasis.
- Choose the semantic element separately from its visual style. Use actual headings for document structure.
- Text applies the shared scale and palette. Supporting text is small and muted; captions are small and quiet.
- Text adds no outer spacing. Stack or the containing component owns the gaps.

Related: [Colors & themes](#colors--themes), [Stacks & action groups](#stacks--action-groups), [Cards](#cards).

### Spacing & shape

#### React usage

```tsx
import { Surface, Stack, Text } from '@envsemble/envui';

<Surface padding={5} render={<Stack gap={4} />}>
  <Text as="h2" variant="section-heading">Workspace</Text>
  <Text>Padding is inside the surface; gap is between its children.</Text>
</Surface>
```

- Spacing steps 1–9: 0.25, 0.5, 0.75, 1, 1.5, 2, 2.5, 3 and 4 rem
- Step 0: Removes padding or gap where the component supports it
- Touch minimum: 2.75 rem for coarse pointers; controls can grow with content
- Outer corners: 1.75 rem for panes, cards and the outside of a row group
- Standard corners: 0.5 rem for inner rows, important actions, toasts and chips
- Other shapes: Fully rounded actions/navigation; icon-only actions keep their variant corners; 0.25 rem checkboxes

#### Guidelines

- Use relative units and the shared spacing scale. The parent owns gaps; each component owns its internal padding.
- Let text wrap and controls grow with content. The application chooses layout breakpoints; there is no separate mobile theme or component set.
- Text has no outer margins. Cards already space direct children; Stack and ActionGroup supply other layouts.
- Use component defaults for geometry. Choose Surface for a plain pane and Card for a content surface.
- Grouped rows keep large outside corners and compact inside joins. Their component page owns the complete row behavior.

Related: [Stacks & action groups](#stacks--action-groups), [Surface](#surface), [Cards](#cards), [Grouped rows](#grouped-rows), [Composition & extension](#composition--extension).

### Composition & extension

#### Build from existing primitives

Surface supplies fill, padding and corners. Stack supplies layout. Card combines those layers with standard content spacing. Specialized cards reuse Card.

Use component props and slots for variations. Keep product data, routing and validation in the application.

#### Compose one root

render lets Surface and Stack share one element. Put the semantic tag on the supplied element. A custom render component must pass native props, className, style, children and ref to its root.

Compose surface and layout behavior on one section. Place it inside the application’s Theme boundary.

```tsx
import { Surface, Stack, Text } from '@envsemble/envui';

export function WorkspacePane() {
  return (
    <Surface tone="pane" padding={5} render={<Stack as="section" gap={4} />}>
      <Text as="h2" variant="section-heading">Workspace</Text>
      <Text>Shared plans and notes for the project.</Text>
    </Surface>
  );
}
```

#### Create a product component

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
      <Text as="h3" variant="section-heading">{title}</Text>
      <Text tone="muted">{description}</Text>
    </Card>
  );
}
```

#### Extend the shared library

When the same visual behavior is needed across products, add a shared variant, slot or component to envUI. Build on its existing primitives and central tokens, and document the public API.

Application CSS can arrange components in a page. Changes to control appearance or interaction belong in the library. Avoid targeting private envUI markup or copying its component styles.

Use the existing light and dark themes. Add intentional base colors centrally; interaction colors continue to follow the shared rule.

Related: [Surface](#surface), [Stacks & action groups](#stacks--action-groups), [Cards](#cards), [Spacing & shape](#spacing--shape), [Colors & themes](#colors--themes).

### Icons & assets

#### React usage

```tsx
import { Icon, EnvUILogo, BrandLogo, Stack } from '@envsemble/envui';
import { Home } from '@envsemble/envui/icons/Home';
import logoUrl from '@envsemble/envui/assets/envUI/envUI-lockup-black.svg';
import faviconUrl from '@envsemble/envui/assets/envUI/envUI-favicon.ico';

<Stack>
  <EnvUILogo />
  <BrandLogo />
  <Home filled label="Home" />
  <Icon viewBox="0 0 24 24" label="Custom mark">
    <path d="M12 2 22 12 12 22 2 12Z" />
  </Icon>
</Stack>
```

- Material symbols: Explicit imports from @envsemble/envui/icons or individual icon paths
- filled: Standalone symbols choose outline or filled; navigation and tabs manage selection fill
- Icon label: Accessible name for a meaningful standalone SVG; omit for decoration
- SVG props: width, height, viewBox, ref and accessible SVG attributes
- EnvUILogo / BrandLogo: Bundled lockups; inherit context color and accept SVG props
- Raw assets: Bundler imports from @envsemble/envui/assets/*; fixed-color SVGs and ICO favicons
- Custom icons: Controls accept React icon content; Icon supplies optional shared SVG defaults

#### Guidelines

- Use the bundled official Material Symbols Rounded. Symbols load locally; no remote icon font or SVG loader is required.
- Search the offline catalogue by name and copy its exact per-icon import. Individual imports avoid loading the full catalogue in product development.
- Icons inherit their context color. Navigation and tabs choose selected fill automatically.
- Decorative icons stay hidden from assistive technology. Standalone meaningful icons need labels; icon-only controls need accessible action names.
- Use bundled brand assets rather than recreating the marks.
- Raw envUI assets include envUI-lockup-black.svg, envUI-lockup-white.svg, envUI-favicon.ico and envUI-favicon-white.ico in assets/envUI/. The raw envsemble logo is assets/envsemble-lockup-black.svg.

Related: [Buttons](#buttons), [Navigation items](#navigation-items), [Tabs](#tabs), [Accessibility](#accessibility).

### Accessibility

#### React usage

```tsx
import { Stack, Input, IconButton } from '@envsemble/envui';
import { ChevronRight } from '@envsemble/envui/icons/ChevronRight';

<Stack>
  <Input label="Project name" hint="Visible labels stay available while typing." />
  <IconButton icon={<ChevronRight />} aria-label="Next project" />
</Stack>
```

- Library ownership: Native control semantics, connected field guidance, keyboard behavior, modal focus and toast announcements
- Application ownership: Labels, heading structure, reading order, product validation and recovery actions
- Keyboard: Tab / Shift+Tab move focus; Enter activates links; Enter / Space activate buttons
- Focus ring: Shared 0.125 rem outline; preserve visible focus and logical keyboard order
- Reduced motion: Library transitions respect prefers-reduced-motion automatically
- Transition tokens: --motion-duration-fast (0.12 s), --motion-duration-medium (0.16 s)
- Shared easing: --motion-ease: cubic-bezier(0.45, 0, 0.2, 1)

#### Guidelines

- Use Tab and Shift+Tab to move focus. Keep a visible focus outline and a keyboard order matching the layout. Specific arrow-key and Escape behavior belongs to each component.
- Keep motion brief and tied to a state change. Respect reduced motion in application animations too.
- Give controls visible labels and icon actions accessible names. Preserve native form behavior and disabled states.
- Use semantic headings, meaningful links and a keyboard order that follows the visible layout.
- Library components handle their focus, keyboard and announcement behavior. Their own pages document those contracts.
- Validate product content and contrast in both supported themes.

Related: [Text fields](#text-fields), [Selects](#selects), [Tabs](#tabs), [Dialogs](#dialogs), [Toasts](#toasts).

## Layout & surfaces

### Stacks & action groups

Use Stack for related content and ActionGroup for buttons.

#### React usage

```tsx
import { Stack, ActionGroup, Button, Text } from '@envsemble/envui';

<Stack gap={4}>
  <Text as="h3" variant="section-heading">Project details</Text>
  <Text>Shared plans and notes for the project.</Text>
  <Text variant="caption">Updated today</Text>
</Stack>

<ActionGroup>
  <Button variant="secondary">Cancel</Button>
  <Button>Save changes</Button>
</ActionGroup>

<ActionGroup stacked>
  <Button>Continue</Button>
  <Button variant="secondary">Cancel</Button>
</ActionGroup>
```

- Stack gap: Spacing step 0–9; default 4 (1 rem); 0 removes the gap
- Stack align: start, center, end or stretch (default)
- Stack as: Semantic container tag; div (default), section, article, nav, main, aside, header or footer
- Stack render: Compose layout onto another root; set the semantic tag on the supplied element instead of as
- ActionGroup stacked: Wrapped row by default; stacked label buttons fill the group
- ActionGroup align: Row alignment: start (default), center or end
- ActionGroup as: Semantic container tag; div by default, footer for card or form actions
- Native element props: children, className, style, ref and accessible attributes

#### Guidelines

- The parent owns space between components; components own their internal padding. Avoid individual child margins.
- Stack uses the shared spacing scale. Step 4 is 1 rem; step 2 is 0.5 rem. Cards already space direct children by 1 rem.
- ActionGroup uses 1 rem gaps in wrapped rows and 0.5 rem when stacked. Icon-only buttons keep their size.
- Use wrapped action rows when space permits and stacked actions when labels need more room. The application chooses when to switch layouts.
- With Stack render, put the semantic tag on the supplied element. Custom components must forward native props and refs.

Related: [Spacing & shape](#spacing--shape), [Surface](#surface), [Cards](#cards).

### Surface

A background pane without automatic spacing between children.

#### React usage

```tsx
import { Surface, Stack, Text } from '@envsemble/envui';

<Surface tone="pane" padding={5} render={<Stack as="section" gap={5} />}>
  <Text as="h2" variant="section-heading">Workspace pane</Text>
  <Text tone="muted">Stack supplies the content layout on the same root.</Text>
</Surface>
```

- tone: pane (default), row, canvas or alternate
- padding: Spacing step 0–9; omitted uses responsive 1–1.5 rem padding
- corners: surface (default, 1.75 rem), standard (0.5 rem), pill or none
- as: Native container tag; div by default, with the semantic tags supported by Stack
- render: Optional root composition; set the tag on the supplied element instead of as
- Native element props: children, ref, className, style and accessible attributes

#### Guidelines

- Surface supplies fill, padding and corners without layout, gaps, margins or interaction.
- Use Surface for plain panes, Card for content surfaces with standard layout, and specialized cards for their specific composition. Card builds on Surface.
- Stack and ActionGroup own layout. Compose Stack through render when the surface itself should arrange its content.
- Use surface corners for ordinary panes; standard and pill shapes serve the documented compact controls and rails. Custom render components must forward native props and refs.

Related: [Spacing & shape](#spacing--shape), [Stacks & action groups](#stacks--action-groups), [Cards](#cards), [Colors & themes](#colors--themes).

### Grouped rows

Group related items with shared outer corners.

#### React usage

```tsx
import { GroupedRows, Row, Button } from '@envsemble/envui';

<GroupedRows>
  <Row title="Notifications" detail="Delivery preferences"
    action={<Button variant="outlined">Manage</Button>} />
  <Row title="Members" detail="Workspace access" />
</GroupedRows>
```

- GroupedRows contrast: Use alternate fill inside a muted pane
- Row title / detail / action: General React content
- Native container props: className and accessible attributes

#### Guidelines

- One row uses the full 1.75 rem outer radius. Multiple rows keep large outer corners and 0.5 rem inner corners.
- Rows have a 3.5 rem minimum height and a 0.125 rem gap. In a muted pane, use contrast fill to distinguish the rows.
- Keep actions short and let long titles and details wrap.

Related: [Surface](#surface), [Cards](#cards), [Radio groups](#radio-groups), [Selects](#selects), [Spacing & shape](#spacing--shape).

### Cards

A content surface with automatic spacing and optional actions.

#### React usage

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

- Card tone / padding: row (default), pane or canvas; optional fixed spacing step 0–9
- Card as / href: div (default), article or button; href renders a native link
- Card heading / meta / actions: Content-card slots; actions adds a footer strip
- Card layout: content (default) or action; actions automatically selects action layout
- ClickableCard: Compatibility wrapper for Card href / Card as="button"; native action props and disabled
- ActionCard: Compatibility wrapper for Card action layout; title maps to heading
- FeatureCard: icon, title, description, action

#### Guidelines

- Use 1.75 rem corners. Row tone is the standalone card fill; pane tone groups content in a quieter background.
- Cards space direct children by 1 rem. FeatureCard keeps compact title/description spacing and separates additional content by 1 rem.
- Card composes Surface and Stack on one root. FeatureCard, ActionCard and ClickableCard reuse that card implementation.
- Use Card href for a single destination or Card as="button" for an action. Do not nest controls inside an interactive card. Use phrasing content such as spans in button cards.
- Interactive cards share the same surface, padding and corners. Hover and pressed derive from the chosen tone; keyboard focus and disabled behavior are shared. Label rich links with aria-labelledby and connect descriptions with aria-describedby.
- The action strip derives its fill from the parent surface. Compose actions from the shared controls.
- Titles, metadata and product data remain application content.

Related: [Surface](#surface), [Stacks & action groups](#stacks--action-groups), [Grouped rows](#grouped-rows), [Typography](#typography).

## Actions

### Buttons

#### Button

```tsx
import { Button } from '@envsemble/envui';
import { Add } from '@envsemble/envui/icons/Add';

<Button variant="primary" startIcon={<Add />} onClick={createItem}>
  Create item
</Button>

<Button iconOnly icon={<Add />} aria-label="Create item" onClick={createItem} />

<Button href="/projects" variant="outlined">Open projects</Button>
```

- variant: primary (default), important, secondary, outlined, destructive
- startIcon / endIcon: Optional React content beside the label
- iconOnly / icon: Show only the supplied icon; size is square and corners follow the chosen variant
- aria-label: Required accessible action name when iconOnly is true
- href: Render a native link with the same button appearance; omit for a native button
- Native action props: disabled, type/onClick or anchor attributes, ref and accessible attributes

#### IconButton

```tsx
import { IconButton } from '@envsemble/envui';
import { ChevronRight } from '@envsemble/envui/icons/ChevronRight';

<IconButton icon={<ChevronRight />} aria-label="Next item" onClick={next} />
```

- icon: React icon content
- variant: Same variants as Button; secondary by default
- aria-label: Required accessible action name
- Native button props: disabled, type, onClick and ref

#### Guidelines

- Use one primary action in an action group. Reserve important emphasis for rare, consequential actions.
- Action buttons fit their content: 2.5 rem minimum height (2 rem for important), 0.875 rem text, 0.25 rem vertical and 0.75 rem horizontal padding. Labels wrap when space is limited.
- Use fully rounded corners; important actions use 0.5 rem corners. ActionGroup provides 1 rem row gaps or 0.5 rem stacked gaps.
- Secondary buttons use the neutral row fill and label color, without a border. Outlined buttons retain their border and link color.
- Interaction colors follow the central HSL lightness rule described in Colors & themes. State colors and disabled opacity come from the shared stylesheet.
- Use href for destinations and onClick for actions. Disabled links have no destination and cannot activate.
- Labeled and icon-only buttons share the 1 rem control icon size used by NavigationItem. Leading and trailing icons follow the same rule, including important buttons.
- Every variant supports iconOnly: a square matching its regular button height (2 rem for important; 2.5 rem for the others). Corners, colors, borders and interaction states follow the chosen variant: important is a rounded square; the others are circles. Name the action, rather than the icon shape.
- IconButton is a shorthand for Button with iconOnly enabled and variant="secondary" by default.

Related: [Stacks & action groups](#stacks--action-groups), [Colors & themes](#colors--themes), [Icons & assets](#icons--assets), [Accessibility](#accessibility).

## Forms & selection

### Text fields

Single-line inputs and multiline textareas share labels, guidance and states.

#### Input

```tsx
import { Input } from '@envsemble/envui';

<Input label="Project name" name="project" value={name}
  onChange={event => setName(event.target.value)}
  hint="A name your team will recognize." required />
```

- label / hint / error: Floating label; hint and bottom-edge error are linked to the control
- Native input props: value/defaultValue, onChange, name, type, required, disabled, readOnly, ref

#### Textarea

```tsx
import { Textarea } from '@envsemble/envui';

<Textarea label="Notes" name="notes" rows={4} sizing="fixed"
  value={notes} onChange={e => setNotes(e.target.value)} />

<Textarea label="Description" name="description" rows={4} sizing="content"
  value={description} onChange={e => setDescription(e.target.value)} />
```

- sizing: "fixed" (default) scrolls within the field; "content" grows and shrinks to fit
- rows: Visible rows in fixed mode; minimum rows in content mode
- label / hint / error: Floating label; hint and bottom-edge error are linked to the control
- Native textarea props: rows, value/defaultValue, onChange, name, required, disabled, readOnly, ref

#### Guidelines

- Use Input for one line and Textarea for multiline content. Textareas have small corners and no resize handle. Fixed sizing scrolls inside the field; content sizing grows and shrinks. Set rows for the initial or minimum height.
- Labels move onto the outline when focused or filled. Placeholders appear while focused; use hints for lasting instructions and errors for a specific recovery step.
- Both support empty, filled, focus, invalid, disabled and read-only states. Validation and draft state belong to the application.

Related: [Markdown editor](#markdown-editor), [Selects](#selects), [Stacks & action groups](#stacks--action-groups), [Accessibility](#accessibility).

### Markdown editor

#### Edit and preview

```tsx
import { MarkdownEditor } from '@envsemble/envui/content';

<MarkdownEditor label="Description" name="description"
  value={description} onValueChange={setDescription}
  previewProps={{ headingOffset: 1, codeCopyable: true }} />
```

- value / onValueChange: The application owns the draft and saving
- defaultValue: Use instead of value for an uncontrolled native form field
- sizing / rows: Fixed scrolling (default) or content growth with a minimum row count
- previewProps: The same heading, link rendering and code-copy options as Markdown

#### Application link picker

```tsx
import { MarkdownEditor, type MarkdownLink } from '@envsemble/envui/content';

// The application supplies its search and picker. Resolve null to cancel.
async function requestLink({ selectedText }: { selectedText: string }):
  Promise<MarkdownLink | null> {
  const resource = await openResourcePicker();
  return resource ? {
    label: selectedText || resource.name,
    href: resource.url,
  } : null;
}

<MarkdownEditor label="Description"
  value={description} onValueChange={setDescription}
  onRequestLink={requestLink} />
```

- onRequestLink: Receives selectedText; use any application-owned picker
- Without a callback: The editor opens its standard text-and-URL link dialog

#### Guidelines

- Use MarkdownEditor for formatted prose, Textarea for plain text. The stored value remains an ordinary Markdown string; syntax stays visible while editing.
- Preview uses Markdown with envUI prose typography and standard GitHub code-block colors. The source control reuses Textarea geometry and states, including fixed or content sizing.
- Formatting and typing share bounded undo/redo history. Ctrl/Cmd+B, I and K apply enabled bold, italic and link commands. Ctrl/Cmd+Z undoes; Shift+Z or Y redoes. Toolbar arrow keys move between actions.
- The editor retains native selection, paste and composition. Formatting waits until composition ends; toolbar actions restore the selection to the source.
- Native forms submit the source even while Preview is visible. Uncontrolled form reset restores defaultValue; controlled reset retains value, so the application resets its own draft. Replacing the controlled document clears its editing history.
- maxLength constrains typing and formatting. disabled and readOnly prevent edits; validation, persistence and save/cancel actions belong to the application.
- Link insertion escapes saved labels and destinations. If the source changes while a picker is open, the insertion is rejected rather than overwriting newer text. Search, permissions and routes remain application responsibilities.

Related: [Markdown](#markdown), [Code](#code), [Text fields](#text-fields), [Accessibility](#accessibility).

### Checkboxes

Independent choices; partial selection represents a group.

#### React usage

```tsx
import { Checkbox } from '@envsemble/envui';

<Checkbox label="Include archived items" name="archived"
  checked={included} onCheckedChange={setIncluded} />
```

- checked / defaultChecked: boolean or "mixed"
- onCheckedChange: Receives the next boolean selection
- label / native props: Visible label, name, value, required, disabled and ref

#### Guidelines

- Use for choices that can be selected independently. Use mixed for a partially selected parent group.
- A Select all checkbox selects or clears its children. Derive mixed from those children; changing an individual choice restores partial selection.
- Keep a visible label and retain native form participation. The application computes aggregate selection.

Related: [Radio groups](#radio-groups), [Switches](#switches), [Accessibility](#accessibility).

### Switches

Use for an on/off setting that applies immediately.

#### React usage

```tsx
import { Switch } from '@envsemble/envui';

<Switch label="Enable notifications" name="notifications"
  checked={enabled} onCheckedChange={setEnabled} />
```

- checked / defaultChecked: boolean
- onCheckedChange: Receives the next boolean
- label / native props: Visible label, disabled, name and ref

#### Guidelines

- Use for a binary setting. Label the setting consistently in either state.
- Use checkbox semantics when the choice is part of a submitted selection.

Related: [Checkboxes](#checkboxes), [Colors & themes](#colors--themes), [Accessibility](#accessibility).

### Radio groups

Choose one option from a visible set.

#### React usage

```tsx
import { RadioGroup, Radio } from '@envsemble/envui';

<RadioGroup label="Access" name="access" value={access}
  onValueChange={setAccess} variant="rows">
  <Radio value="team" label="Team" detail="Everyone in your workspace" />
  <Radio value="private" label="Private" detail="Only invited people" />
</RadioGroup>
```

- RadioGroup: label, name, value/defaultValue, onValueChange, required, disabled
- variant: inline (default) or rows
- Radio: value, label, detail, disabled and native input props

#### Guidelines

- Use radios when one alternative must be selected and the choices benefit from being visible together.
- Selectable rows reuse the grouped-row geometry. Use a unique group name for each form.

Related: [Selects](#selects), [Checkboxes](#checkboxes), [Grouped rows](#grouped-rows).

### Selects

Choose one option while keeping alternatives collapsed.

#### React usage

```tsx
import { Select } from '@envsemble/envui';

<Select label="Visibility" name="visibility" value={visibility}
  onValueChange={setVisibility} options={[
    { value: 'team', label: 'Team' },
    { value: 'private', label: 'Private' },
  ]} />
```

- options: Array of { value, label, disabled? }
- value / defaultValue: Selected string, or null
- onValueChange: Receives selected string or null
- label / hint / error: Visible label and linked guidance or validation, shared with text fields
- Native participation: name, disabled, required and form

#### Guidelines

- Use a select to save space when a single choice has several alternatives.
- Use the tonal trigger, selected indication and grouped option geometry. Keyboard navigation, typeahead and dismissal come from the component.
- Option focus rings appear for keyboard interaction, not pointer opening or hover.
- Label, hint and error use the same field structure as Input and Textarea. The application owns validation.

Related: [Radio groups](#radio-groups), [Text fields](#text-fields), [Grouped rows](#grouped-rows), [Accessibility](#accessibility).

## Navigation

### Navigation items

Links to another destination; routing stays with the app.

#### React usage

```tsx
import { NavigationItem } from '@envsemble/envui';
import { Home } from '@envsemble/envui/icons/Home';

<NavigationItem href="#/home" selected={page === 'home'}
  icon={<Home />}>
  Home
</NavigationItem>

// Keep the same item when the sidebar is collapsed or expanded.
<NavigationItem href="#/home" selected={page === 'home'}
  icon={<Home />} iconOnly={collapsed} aria-label="Home">
  Home
</NavigationItem>
```

- href: Renders a link; omit for a button action
- selected / disabled: Current destination and unavailable state
- size: standard (default) or compact labels; both keep the navigation minimum height
- iconOnly: Hide the visible label and center the icon in a circular control; accepts sidebar collapse state
- aria-label: Required accessible destination name when iconOnly is enabled; icon is also required
- icon: Material Symbols fill automatically when selected; custom React icons are supported
- selectedIcon: Optional selected variant for custom icons
- children / native props: Destination label and link/button attributes

#### Guidelines

- The application owns routing and the selected destination. Use a meaningful destination label.
- Pass one Material Symbol. Navigation renders its filled variant when selected and its outline otherwise, including icons inside wrappers.
- Unselected icons use the caption color; selected icon and label use the link color. Navigation fits its content with a 2.5 rem minimum height.
- Both label sizes use the shared 1 rem control icon size, matching labeled and icon-only buttons.
- Use iconOnly for a collapsed sidebar. Supply icon and aria-label; children can remain in place for the expanded label. The circle matches the navigation height and keeps selection, automatic icon fill, focus and disabled behavior.
- Selection keeps the gray/blue styling. Hover and pressed preserve the base hue and saturation and use the central lightness rule.

Related: [Tabs](#tabs), [Direction links](#direction-links), [Icons & assets](#icons--assets), [Colors & themes](#colors--themes).

### Tabs

Switches between content panels in the same view.

#### React usage

```tsx
import { Tabs, Button, Text } from '@envsemble/envui';

<Tabs aria-label="Project views" defaultValue="summary" keepMounted
  items={[
    { value: 'summary', button: <Button>Summary</Button>,
      content: <Text>A shared space for project plans and notes.</Text> },
    { value: 'details', button: <Button>Details</Button>,
      content: <Text>The project is ready for review.</Text> },
    { value: 'activity', button: <Button>Activity</Button>,
      content: <Text>The draft was updated today.</Text> },
  ]}
/>
```

- items: Unique string value, button element, content and optional disabled for each tab
- aria-label: Required name for the tab list
- value / defaultValue: Controlled or initial selection; defaults to the first enabled item
- onValueChange: Receives the selected string, or null when no selection remains
- activation: automatic (default) selects on focus; manual requires Enter or Space
- orientation: horizontal (default) or vertical; keyboard arrows follow the orientation
- keepMounted: Preserve inactive content state; default false unmounts it after transition
- listClassName / panelClassName: Optional layout classes for the list and panels
- renderList: Wraps the supplied tab list in a custom layout; render the list once
- Native div props: className, style, ref and accessible attributes on the root

#### Guidelines

- Use tabs for related views in one place. Tabs owns selection, linked panels and keyboard behavior; your application owns any URL synchronization.
- Use renderList to place the tab list alongside a heading or other content inside a Card. Keep panels outside that wrapper and render the supplied list once.
- Supply Button, IconButton, NavigationItem without href, or a custom component that forwards native button props and ref. Do not nest another control inside a tab. Icon-only tabs need an accessible name.
- The rail uses the muted surface color to stand apart from background panes, with 0.25 rem padding and gaps. Only the selected tab shows its supplied button fill; its hover and pressed colors follow the existing button rules. Official icons fill automatically when selected.
- Arrow keys move between enabled tabs; Home and End reach the ends. Use manual activation for content that takes time to load. Disabled tabs are skipped.
- Selection and panels transition over 0.16 s with shared easing. Reduced motion removes transitions. Inactive panels are hidden and inert; keepMounted preserves their local state.

Related: [Navigation items](#navigation-items), [Buttons](#buttons), [Icons & assets](#icons--assets), [Accessibility](#accessibility).

### Direction links

Centered previous and next destinations, together or individually.

#### React usage

```tsx
import { DirectionLinks, DirectionLink } from '@envsemble/envui';
import { ArrowBack } from '@envsemble/envui/icons/ArrowBack';
import { ArrowForward } from '@envsemble/envui/icons/ArrowForward';

// Place after the page content. The library owns the centered link layout.
<DirectionLinks
  previous={{ href: '/typography', children: 'Typography', icon: <ArrowBack /> }}
  next={{ href: '/spacing', children: 'Spacing & shape', icon: <ArrowForward /> }}
/>

// Omit the missing destination at either end of the sequence.
<DirectionLinks next={{ href: '/getting-started', children: 'Getting started' }} />
<DirectionLinks previous={{ href: '/typography', children: 'Typography' }} />

// DirectionLink remains available for an individual destination.
<DirectionLink direction="next" href="/getting-started">
  Getting started
</DirectionLink>
```

- DirectionLinks: previous / next: Optional destination objects with href, children, icon and native link props; omit or pass null for a missing destination
- DirectionLinks: native nav props: ref, className, style and accessible attributes; aria-label defaults to Previous and next content
- DirectionLink: direction: Required: previous or next; sets the direction label and icon placement
- DirectionLink: children: Destination text; wraps when space is limited
- DirectionLink: href: Required destination URL; renders a native link
- DirectionLink: icon: Optional decorative React content; no icon is inserted by default
- DirectionLink: native link props: ref, onClick, target, rel, className and accessible attributes

#### Guidelines

- Use for previous and next destinations in ordered content. The component supplies Previous or Up next; the application supplies the destination text and routing.
- The destination is the main text. Its supporting direction label sits above it inside a compact outlined rectangle with standard rounding.
- Optional icons appear before previous destinations and after next destinations. Choose an appropriate arrow; icons are decorative and the text provides the accessible name.
- Place DirectionLinks after the page content. It bundles the destinations side by side with shared spacing and centers the group within the available width. The page owns bottom placement and outer spacing.
- Supply previous, next or both. A single destination stays centered without an empty placeholder; omitting both renders nothing. Previous always precedes next in reading and keyboard order.
- DirectionLinks renders a named navigation landmark and preserves native link behavior. Override aria-label when several groups need distinct names. Each destination accepts the same link props as DirectionLink except direction, which the group supplies.
- Links stay side by side when they fit and wrap onto centered rows in narrow containers, keeping destination text readable. Titles wrap at word boundaries; unbroken text can wrap within a word to avoid overflow. DirectionLink remains available for standalone links with application-owned placement.
- Hover and pressed use the shared subtle-action and border colors. Keyboard focus has a visible outline, and text wraps without growing beyond its container.

Related: [Navigation items](#navigation-items), [Stacks & action groups](#stacks--action-groups), [Typography](#typography).

## Content & guidance

### Markdown

#### Render content

```tsx
import { Markdown } from '@envsemble/envui/content';

<Markdown headingOffset={1} codeCopyable>{description}</Markdown>
```

- children: Markdown string
- headingOffset / codeCopyable: Heading semantics and code-copy controls

#### Markdown source

```tsx
import { Markdown } from '@envsemble/envui/content';

const description = [
  '## Project checklist',
  '',
  'Prepare the **sample project** for review.',
  '- Review the [draft document](/documents/draft).',
  '',
  '```json',
  '{ "enabled": true, "retries": 3 }',
  '```',
].join('\n');

<Markdown headingOffset={1} codeCopyable>{description}</Markdown>
```

- Code fences: Supply a language after the opening fence; code reuses the GitHub-themed CodeBlock
- Inline code: Single backticks mark inline source within prose

#### Application navigation

```tsx
import { Markdown } from '@envsemble/envui/content';

<Markdown renderLink={({ href, children, ...props }) => (
  <a {...props} href={href} onClick={event => {
    if (!event.defaultPrevented && event.button === 0 &&
        !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey &&
        href.startsWith('/documents/')) {
      event.preventDefault();
      openDocumentPanel(href);
    }
  }}>{children}</a>
)}>{description}</Markdown>
```

- renderLink: Keep real hrefs and preserve modified clicks; the application decides which routes open panels

#### Guidelines

- Paragraphs, headings, lists, quotes and tables use envUI typography and spacing. Code blocks reuse CodeBlock with standard GitHub colors.
- Supports CommonMark plus GFM tables, strikethrough, task lists, automatic links and footnotes. Single source newlines follow standard paragraph behavior.
- Raw HTML is ignored and URLs retain the renderer’s safe protocol handling. Markdown is content, not executable components.
- Resource references are ordinary links with stable destination URLs. Labels are saved text; resource resolution, permissions and missing destinations belong to the application.
- Tables and code scroll within their own regions. Images keep their aspect ratio and fit the available width; image loading follows the supplied URL.
- Choose headingOffset to place a document below the surrounding page heading. Native semantic levels are retained, capped at h6.

Related: [Markdown editor](#markdown-editor), [Code](#code), [Typography](#typography), [Accessibility](#accessibility).

### Code

#### React usage

```tsx
import { Text } from '@envsemble/envui';
import { Code, CodeBlock } from '@envsemble/envui/content';

<Text>Use <Code>npm run build</Code> to build the application.</Text>
<CodeBlock language="tsx" copyable>{source}</CodeBlock>
```

- Code: Native code attributes and inline content
- CodeBlock children: The original source string; whitespace and copying stay intact
- language: JS/JSX, TS/TSX, Java, JSON, HTML, CSS, SQL, shell, YAML, Markdown, INI; aliases are supported
- copyable / label: Optional copy control and source label
- wrap: Wrap long lines; otherwise scroll inside the block
- theme: GitHub Light Default or GitHub Dark Default; follows Theme unless explicitly set
- Native div props: Root ref, className, style and accessible attributes

#### Guidelines

- Use Code inside prose and CodeBlock for multiline source. Source is selectable and never executed.
- Code blocks use the standard GitHub Light Default and GitHub Dark Default themes. Prose and controls retain envUI typography and spacing.
- Highlighting starts after the initial render and shares one runtime. Theme changes reuse the tokens. Unsupported languages remain plain text.
- Blocks above 50,000 characters or with a line above 2,000 characters stay plain text to avoid expensive highlighting.
- Copy uses the original source. If clipboard access is unavailable, the code is selected for manual copying.

Related: [Markdown](#markdown), [Markdown editor](#markdown-editor), [Typography](#typography), [Accessibility](#accessibility).

### Info chips

Read-only metadata beside related content.

#### React usage

```tsx
import { InfoChip, ActionGroup } from '@envsemble/envui';

<ActionGroup>
  <InfoChip>Optional</InfoChip>
  <InfoChip>3 members</InfoChip>
</ActionGroup>
```

- InfoChip: children and native span attributes

#### Guidelines

- Use chips for short metadata. They have no hover, focus, filtering or selected state.
- Place metadata beside the content it describes. Use a button for an action or a selection control for a choice.

Related: [Cards](#cards), [Typography](#typography), [Disclosure notes](#disclosure-notes).

### Disclosure notes

Keep optional details collapsed until needed.

#### React usage

```tsx
import { DisclosureNote, Text } from '@envsemble/envui';

<DisclosureNote title="How visibility works">
  <Text>Team projects are available to every workspace member.</Text>
</DisclosureNote>
```

- DisclosureNote title / children: One-line summary and optional detail
- open / onToggle: Native details state and event for controlled specimen state
- Native details props: ref, className and accessible attributes

#### Guidelines

- Keep a disclosure title on one line. Put secondary guidance behind the disclosure and essential instructions beside the task.
- Use the native disclosure interaction. Keep labels short enough for the available width.

Related: [Info chips](#info-chips), [Typography](#typography), [Text fields](#text-fields).

## Feedback & overlays

### Empty states

#### React usage

```tsx
import { EmptyState, Button } from '@envsemble/envui';
import { Search } from '@envsemble/envui/icons/Search';

<EmptyState icon={<Search />} title="No results"
  description="Try a different name or clear the filters."
  action={<Button variant="secondary" onClick={clearFilters}>Clear filters</Button>} />
```

- title / description: Heading and concise explanation
- icon / action: Optional React content

#### Guidelines

- Distinguish first-use emptiness from a search with no results.
- Offer an action that resolves the situation. Keep the content aligned to the start.

Related: [Loading](#loading), [Cards](#cards), [Buttons](#buttons).

### Loading

Announces loading and reserves space for incoming content.

#### React usage

```tsx
import { LoadingState, Skeleton } from '@envsemble/envui';

<LoadingState label="Loading project">
  <Skeleton width="38%" height="1.25rem" />
  <Skeleton width="100%" height="0.8rem" />
  <Skeleton width="72%" height="0.8rem" />
</LoadingState>
```

- Skeleton width / height: CSS dimensions appropriate for anticipated content
- LoadingState label / children: Accessible loading announcement and visual placeholders

#### Guidelines

- Match placeholders to expected content without implying a precise completion time.
- Announce loading once per region. Respect the operating system reduced motion preference.

Related: [Empty states](#empty-states), [Cards](#cards), [Accessibility](#accessibility).

### Toasts

Brief feedback; errors and notices with actions stay until dismissed.

#### React usage

```tsx
import { Theme, Button, ToastProvider, useToast } from '@envsemble/envui';

function SaveButton() {
  const toast = useToast();
  return <Button onClick={() => toast.show({
    variant: 'success', message: 'Changes saved',
  })}>Save</Button>;
}

<Theme theme="light">
  <ToastProvider defaultPlacement="bottom-right"><SaveButton /></ToastProvider>
</Theme>
```

- Toast: variant: neutral, success, info, error; message; action {label,onClick}; onDismiss
- ToastProvider defaultPlacement: bottom-right (upward) or top-center (downward)
- ToastProvider visibleLimit: Three visible notices per placement by default; FIFO overflow
- useToast(): show(options) returns ID; dismiss(id) removes a notice; clear() removes all
- Notification options: placement override, dismissible and duration; errors/actions persist
- Manual Toast announce: true by default; false for static specimens

#### Guidelines

- Neutral, success and info notices without actions expire after five seconds. Errors and notices with actions persist until dismissed.
- Timers pause during hover, keyboard focus or an inactive window. Each placement shows three notices; queued lifetimes start on display.
- Keep messages and actions short. Messages stay single-line and truncate to available space. Manual Toast shares the presentation; the consumer owns its lifetime.

Related: [Dialogs](#dialogs), [Buttons](#buttons), [Colors & themes](#colors--themes), [Accessibility](#accessibility).

### Dialogs

Centered modals and side panels share focus and dismissal behavior.

#### React usage

```tsx
import { Dialog, Button, Text } from '@envsemble/envui';

<Dialog trigger={<Button variant="secondary">View project</Button>}
  title="Sample project" description="Project details" closeLabel="Close">
  <Text>Shared plans, milestones and responsibilities for the project.</Text>
</Dialog>

<Dialog trigger={<Button variant="secondary">Inspect project</Button>}
  title="Project details" placement="right" modal={false} disablePointerDismissal>
  <Text>Shared plans and people for the sample project.</Text>
</Dialog>
```

- trigger / title / description: Launch control and accessible modal labeling
- children / actions: General content and shared controls
- closeLabel: Built-in dismissal label; defaults to Close
- placement: center (default) or right; right is a full-height side panel with a header close button
- modal: true (default) traps focus, blocks outside interaction and locks page scroll; false permits interaction with the page
- disablePointerDismissal: false by default; true keeps an inspector open on outside presses or focus changes
- open / defaultOpen / onOpenChange: Controlled or uncontrolled visibility
- DialogClose: Additional dismissal action; shared button props
- initialFocus / finalFocus: Optional focus refs

#### Guidelines

- Use a centered modal for a focused confirmation or short form. Use a right panel to inspect content; set modal=false when its source page should remain interactive.
- Centered dialogs include a footer dismissal; right panels include a header close button. Escape closes either placement and focus returns to the trigger or finalFocus ref.
- Modal dialogs trap focus; non-modal panels do not. Portals preserve the originating theme.
- The application owns validation, saving, async work and whether completion closes the dialog.

Related: [Toasts](#toasts), [Text fields](#text-fields), [Stacks & action groups](#stacks--action-groups), [Accessibility](#accessibility).

## Local edits and upgrades

In the design-system repository, run npm install and npm run dev. The documentation workspace consumes the public package through the local workspace. Changes appear during development without publishing or changing the package version. A future product can use the same workspace connection; product integration is separate work. Adopt a published version intentionally with npm install @envsemble/envui@<version>, review CHANGELOG.md, and validate the consumer before release. Every release has a matching offline documentation HTML.
