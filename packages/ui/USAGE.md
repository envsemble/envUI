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
import { Add } from '@envsemble/envui/icons';
import '@envsemble/envui/styles.css';

export function App() {
  return <Theme theme="light">
    <Button startIcon={<Add />}>Create item</Button>
  </Theme>;
}
```

Use Theme theme="light" or theme="dark". Inter, tokens and assets are included. Imports from @envsemble/envui/icons are explicit, and icons accept filled, width, height and accessible SVG attributes. Components accept custom React icon content.

## Content & action layout

Shared spacing for text, fields and grouped actions.

```tsx
import { Card, Stack, ActionGroup, Input, Button } from '@envsemble/envui';

<Card>
  <h3>Project details</h3>
  <p>Cards space their direct children automatically.</p>
  <Stack gap={4}>
    <Input label="Name" name="name" />
    <Input label="Description" name="description" />
  </Stack>
  <ActionGroup>
    <Button variant="secondary">Cancel</Button>
    <Button>Save changes</Button>
  </ActionGroup>
</Card>

<ActionGroup stacked>
  <Button>Continue</Button>
  <Button variant="secondary">Cancel</Button>
</ActionGroup>
```

- Stack gap: Spacing step 0–9; default 4 (1 rem); 0 removes the gap
- Stack align: start, center, end or stretch (default)
- Stack as: Semantic container tag; div (default), section, article, nav, main, aside, header or footer
- Stack render: Compose layout onto another root element or component without a wrapper
- ActionGroup stacked: Wrapped row by default; stacked label buttons fill the group
- ActionGroup align: Row alignment: start (default), center or end
- ActionGroup as: Semantic container tag; div by default, footer for card or form actions
- Native element props: children, className, style, ref and accessible attributes

The parent owns space between components; components own their internal padding. Avoid individual child margins.

Stack uses the shared spacing scale. Step 4 is 1 rem; step 2 is 0.5 rem. Cards already space direct children by 1 rem.

ActionGroup uses 1 rem gaps in wrapped rows and 0.5 rem when stacked. Circular icon buttons keep their size.

## Surface

Shared backgrounds, padding and corners for panes and cards.

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

Surface supplies fill, padding and corners without layout, gaps, margins or interaction.

Use Surface for plain panes, Card for content surfaces with standard layout, and specialized cards for their specific composition. Card builds on Surface.

Stack and ActionGroup own layout. Compose Stack through render when the surface itself should arrange its content.

Use surface corners for ordinary panes; standard and pill shapes serve the documented compact controls and rails. Custom render components must forward native props and refs.

## Text

Shared typography and semantic text colors without custom CSS.

```tsx
import { Text, Stack } from '@envsemble/envui';

<Stack>
  <Text as="h1" variant="page-heading">Project overview</Text>
  <Text tone="muted">Shared context for your team.</Text>
  <Text variant="caption">Updated today</Text>
</Stack>
```

- variant: body (default), page-heading, section-heading, supporting or caption
- tone: Optional primary, muted or quiet override of the variant’s default color
- as: Native text tag; p (default), span, small, strong or h1–h6
- Native element props: children, ref, className and accessible attributes

Choose the semantic element separately from its visual emphasis. Use actual headings for document structure.

Text uses the shared Inter scale and palette. Supporting text is small and muted; captions are small and quiet.

Text adds no outer spacing. Use Stack or the surrounding component for gaps.

## Buttons

Clear actions with a shared size, spacing and state treatment.

```tsx
import { Button } from '@envsemble/envui';
import { Add } from '@envsemble/envui/icons';

<Button variant="primary" startIcon={<Add />} onClick={createItem}>
  Create item
</Button>

<Button href="/projects" variant="outlined">Open projects</Button>
```

- variant: primary (default), important, secondary, outlined, destructive
- startIcon / endIcon: Optional React content beside the label
- href: Render a native link with the same button appearance; omit for a native button
- Native action props: disabled, type/onClick or anchor attributes, ref and accessible attributes

Use one primary action in an action group. Reserve important emphasis for rare, consequential actions.

Action buttons fit their content: 2 rem minimum height, 0.875 rem text, 0.25 rem vertical and 0.75 rem horizontal padding. Labels wrap when space is limited.

Use fully rounded corners; important actions use 0.5 rem corners. ActionGroup provides 1 rem row gaps or 0.5 rem stacked gaps.

Interaction colors follow the central HSL lightness rule described in Colors & themes. State colors and disabled opacity come from the shared stylesheet.

Use href for destinations and onClick for actions. Disabled links have no destination and cannot activate.

## Icon buttons

Compact circular actions with a clear accessible name.

```tsx
import { IconButton } from '@envsemble/envui';
import { ChevronRight } from '@envsemble/envui/icons';

<IconButton icon={<ChevronRight />} aria-label="Next item" onClick={next} />
```

- icon: React icon content
- aria-label: Required accessible action name
- Native button props: disabled, type, onClick and ref

Use a 2.5 rem circle with a centered 1.5 rem icon and 0.5 rem inset.

Use the tonal row fill and neutral icon. Name the action, rather than describing the icon shape.

## Text inputs

Single-line entry with visible labels and connected help.

```tsx
import { Input } from '@envsemble/envui';

<Input label="Project name" name="project" value={name}
  onChange={event => setName(event.target.value)}
  hint="A name your team will recognize." required />
```

- label / hint / error: React content; hint and error are linked to the control
- Native input props: value/defaultValue, onChange, name, type, required, disabled, readOnly, ref

Keep the label visible. Use hints for instructions and errors for a specific recovery step.

Inputs support empty, filled, focus, invalid, disabled and read-only states. Keep form validation and draft state in the application.

## Textareas

Longer entry using the same label, hint and error treatment.

```tsx
import { Textarea } from '@envsemble/envui';

<Textarea label="Description" name="description" rows={4}
  value={description} onChange={e => setDescription(e.target.value)} />
```

- label / hint / error: React content with accessible connections
- Native textarea props: rows, value/defaultValue, onChange, name, required, disabled, readOnly, ref

Use for content that needs multiple lines. Set rows to reflect the expected amount of entry.

Allow resizing and preserve the same state treatment as single-line fields.

## Checkboxes

Independent choices, including partial group selection.

```tsx
import { Checkbox } from '@envsemble/envui';

<Checkbox label="Include archived items" name="archived"
  checked={included} onCheckedChange={setIncluded} />
```

- checked / defaultChecked: boolean or "mixed"
- onCheckedChange: Receives the next boolean selection
- label / native props: Visible label, name, value, required, disabled and ref

Use for choices that can be selected independently. Use mixed for a partially selected parent group.

Keep a visible label and retain native form participation. The application computes aggregate selection.

## Switches

A binary setting that can be understood as on or off.

```tsx
import { Switch } from '@envsemble/envui';

<Switch label="Enable notifications" name="notifications"
  checked={enabled} onCheckedChange={setEnabled} />
```

- checked / defaultChecked: boolean
- onCheckedChange: Receives the next boolean
- label / native props: Visible label, disabled, name and ref

Use for a binary setting. Label the setting consistently in either state.

Use checkbox semantics when the choice is part of a submitted selection.

## Radio groups

One selection from a visible set of alternatives.

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

Use radios when alternatives benefit from being visible together. Keep the existing native radio treatment.

Selectable rows reuse the grouped-row geometry. Use a unique group name for each form.

## Selects

A compact choice with a tonal trigger and grouped option rows.

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

Use a select to save space when a single choice has several alternatives.

Use the tonal trigger, selected indication and grouped option geometry. Keyboard navigation, typeahead and dismissal come from the component.

Option focus rings appear for keyboard interaction, not pointer opening or hover.

Label, hint and error use the same field structure as Input and Textarea. The application owns validation.

## Navigation

Quiet destinations and a clear selected location.

```tsx
import { NavigationItem } from '@envsemble/envui';
import { Home } from '@envsemble/envui/icons';

<NavigationItem href="#/home" selected={page === 'home'}
  icon={<Home />}>
  Home
</NavigationItem>
```

- href: Renders a link; omit for a button action
- selected / disabled: Current destination and unavailable state
- size: standard (default) or compact labels; both keep the navigation minimum height
- icon: Material Symbols fill automatically when selected; custom React icons are supported
- selectedIcon: Optional selected variant for custom icons
- children / native props: Destination label and link/button attributes

The application owns routing and the selected destination. Use a meaningful destination label.

Pass one Material Symbol. Navigation renders its filled variant when selected and its outline otherwise, including icons inside wrappers.

Unselected icons use the caption color; selected icon and label use the link color. Navigation fits its content with a 2.5 rem minimum height.

Selection keeps the gray/blue styling. Hover and pressed preserve the base hue and saturation and use the central lightness rule.

## Tabs

One selection, a quiet rail and animated content panels.

```tsx
import { Tabs, Button, Card } from '@envsemble/envui';

<Tabs aria-label="Project views" defaultValue="preview" keepMounted
  items={[
    { value: 'preview', button: <Button>Preview</Button>,
      content: <Card>Live preview</Card> },
    { value: 'guidelines', button: <Button>Guidelines</Button>,
      content: <Card>Design guidelines</Card> },
    { value: 'usage', button: <Button>Usage</Button>,
      content: <Card>React usage</Card> },
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
- Native div props: className, style, ref and accessible attributes on the root

Use tabs for related views in one place. Tabs owns selection, linked panels and keyboard behavior; your application owns any URL synchronization.

Supply Button, IconButton, NavigationItem without href, or a custom component that forwards native button props and ref. Do not nest another control inside a tab. Icon-only tabs need an accessible name.

The rail uses the pane color with 0.25 rem padding and gaps. Only the selected tab shows its supplied button fill; its hover and pressed colors follow the existing button rules. Official icons fill automatically when selected.

Arrow keys move between enabled tabs; Home and End reach the ends. Use manual activation for content that takes time to load. Disabled tabs are skipped.

Selection and panels transition over 0.16 s with shared easing. Reduced motion removes transitions. Inactive panels are hidden and inert; keepMounted preserves their local state.

## Direction links

Previous and up-next destinations with consistent direction, text and optional icons.

```tsx
import { DirectionLink, ActionGroup } from '@envsemble/envui';
import { ArrowBack, ArrowForward } from '@envsemble/envui/icons';

<ActionGroup>
  <DirectionLink direction="previous" href="/typography" icon={<ArrowBack />}>
    Typography
  </DirectionLink>
  <DirectionLink direction="next" href="/spacing" icon={<ArrowForward />}>
    Spacing & shape
  </DirectionLink>
</ActionGroup>

<DirectionLink direction="next" href="/getting-started">
  Getting started
</DirectionLink>
```

- direction: Required: previous or next; sets the direction label and icon placement
- children: Destination text; wraps when space is limited
- href: Required destination URL; renders a native link
- icon: Optional decorative React content; no icon is inserted by default
- Native link props: ref, onClick, target, rel, className and accessible attributes

Use for previous and next destinations in ordered content. The component supplies Previous or Up next; the application supplies the destination text and routing.

The destination is the main text. Its supporting direction label sits above it inside a compact outlined rectangle with standard rounding.

Optional icons appear before previous destinations and after next destinations. Choose an appropriate arrow; icons are decorative and the text provides the accessible name.

Show only destinations that exist. Arrange links using an existing layout component; DirectionLink represents one destination.

Hover and pressed use the shared subtle-action and border colors. Keyboard focus has a visible outline, and text wraps without growing beyond its container.

## Grouped rows

Connected content with generous outer corners and compact inner joins.

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

One row uses the full 1.75 rem outer radius. Multiple rows keep large outer corners and 0.5 rem inner corners.

Rows have a 3.5 rem minimum height and a 0.125 rem gap. In a muted pane, use contrast fill to distinguish the rows.

Keep actions short and let long titles and details wrap.

## Cards

Rounded surfaces for related content and familiar action compositions.

```tsx
import { Card, FeatureCard, Button } from '@envsemble/envui';
import { Apps } from '@envsemble/envui/icons';

<Card href="/projects" aria-labelledby="projects-title">
  <h3 id="projects-title">Projects</h3>
  <p>Open your shared workspace.</p>
</Card>

<Card as="button" onClick={openProject}>
  <span>Open project</span>
</Card>

<FeatureCard icon={<Apps />} title="Connected workspace"
  description="Bring your team and tools together."
  action={<Button>Explore</Button>} />

<Card as="article" heading="Project overview" meta="Updated today"
  actions={<Button variant="outlined">Open project</Button>}>
  Shared context for the next release.
</Card>
```

- Card tone / padding: row (default), pane or canvas; optional fixed spacing step 0–9
- Card as / href: div (default), article or button; href renders a native link
- Card heading / meta / actions: Content-card slots; actions adds a footer strip
- Card layout: content (default) or action; actions automatically selects action layout
- ClickableCard: Compatibility wrapper for Card href / Card as="button"; native action props and disabled
- ActionCard: Compatibility wrapper for Card action layout; title maps to heading
- FeatureCard: icon, title, description, action

Use 1.75 rem corners. Row tone is the standalone card fill; pane tone groups content in a quieter background.

Cards space direct children by 1 rem. FeatureCard keeps compact title/description spacing and separates additional content by 1 rem.

Card composes Surface and Stack on one root. FeatureCard, ActionCard and ClickableCard reuse that card implementation.

Use Card href for a single destination or Card as="button" for an action. Do not nest controls inside an interactive card. Use phrasing content such as spans in button cards.

Interactive cards share the same surface, padding and corners. Hover and pressed derive from the chosen tone; keyboard focus and disabled behavior are shared. Label rich links with aria-labelledby and connect descriptions with aria-describedby.

The action strip derives its fill from the parent surface. Compose actions from the shared controls.

Titles, metadata and product data remain application content.

## Chips & notes

Metadata stays compact; optional guidance expands when needed.

```tsx
import { InfoChip, DisclosureNote } from '@envsemble/envui';

<InfoChip>Optional</InfoChip>
<DisclosureNote title="How visibility works">
  <p>Team projects are available to every workspace member.</p>
</DisclosureNote>
```

- InfoChip children: Noninteractive metadata; span attributes
- DisclosureNote title / children: One-line summary and optional detail
- open / onToggle: Native details state and event for controlled specimen state

Info chips describe content and have no hover, focus, filtering or selected state.

Keep a disclosure title on one line. Put secondary guidance behind the disclosure and essential instructions beside the task.

## Empty states

Explain missing content and offer a relevant next action.

```tsx
import { EmptyState, Button } from '@envsemble/envui';
import { Search } from '@envsemble/envui/icons';

<EmptyState icon={<Search />} title="No results"
  description="Try a different name or clear the filters."
  action={<Button variant="secondary" onClick={clearFilters}>Clear filters</Button>} />
```

- title / description: Heading and concise explanation
- icon / action: Optional React content

Distinguish first-use emptiness from a search with no results.

Offer an action that resolves the situation. Keep the content aligned to the start.

## Loading

Show content geometry while announcing that work is in progress.

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

Match placeholders to expected content without implying a precise completion time.

Announce loading once per region. Respect the operating system reduced motion preference.

## Toasts

Brief feedback with optional recovery and explicit dismissal.

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

Neutral, success and info notices without actions expire after five seconds. Errors and notices with actions persist until dismissed.

Timers pause during hover, keyboard focus or an inactive window. Each placement shows three notices; queued lifetimes start on display.

Keep messages and actions short. Messages stay single-line and truncate to available space. Manual Toast shares the presentation; the consumer owns its lifetime.

## Dialogs

Focused confirmation or entry with a modal boundary and return focus.

```tsx
import { Dialog, Button, Input } from '@envsemble/envui';

<Dialog trigger={<Button>Create project</Button>} title="Create project"
  description="Choose a name your team will recognize."
  closeLabel="Cancel" actions={<Button onClick={save}>Create</Button>}>
  <Input label="Project name" value={name} onChange={e => setName(e.target.value)} />
</Dialog>
```

- trigger / title / description: Launch control and accessible modal labeling
- children / actions: General content and shared controls
- closeLabel: Built-in dismissal label; defaults to Close
- open / defaultOpen / onOpenChange: Controlled or uncontrolled visibility
- DialogClose: Additional dismissal action; shared button props
- initialFocus / finalFocus: Optional focus refs

Use a modal for a focused confirmation or a short form. The footer always provides a dismissal action.

The dialog traps focus, handles Escape and returns focus to the trigger. Portals preserve the originating theme.

The application owns validation, saving, async work and whether completion closes the dialog.

## Local edits and upgrades

In the design-system repository, run npm install and npm run dev. The documentation workspace consumes the public package through the local workspace. Changes appear during development without publishing or changing the package version. A future product can use the same workspace connection; product integration is separate work. Adopt a published version intentionally with npm install @envsemble/envui@<version>, review CHANGELOG.md, and validate the consumer before release. Every release has a matching offline documentation HTML.
