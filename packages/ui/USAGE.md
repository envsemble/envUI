# @envsemble/ui usage

React 19 components for current browsers. Import the public package API and one stylesheet. Theme preference, routing, validation and product data belong to the application.

## Install

Configure private GitHub Packages access using an environment token with read:packages and package access. Keep credentials outside committed files.

```ini
# Project .npmrc
@envsemble:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

```sh
npm install @envsemble/ui react@^19 react-dom@^19
```

## First component

```tsx
import { Theme, Button } from '@envsemble/ui';
import { Add } from '@envsemble/ui/icons';
import '@envsemble/ui/styles.css';

export function App() {
  return <Theme theme="light">
    <Button startIcon={<Add />}>Create item</Button>
  </Theme>;
}
```

Use Theme theme="light" or theme="dark". Inter, tokens and assets are included. Imports from @envsemble/ui/icons are explicit, and icons accept filled, width, height and accessible SVG attributes. Components accept custom React icon content.

## Buttons

Clear actions with a shared size, spacing and state treatment.

```tsx
import { Button } from '@envsemble/ui';
import { Add } from '@envsemble/ui/icons';

<Button variant="primary" startIcon={<Add />} onClick={createItem}>
  Create item
</Button>
```

- variant: primary (default), important, secondary, outlined, destructive
- startIcon / endIcon: Optional React content beside the label
- Native button props: disabled, type, onClick, name, ref and accessible attributes

Use one primary action in an action group. Reserve important emphasis for rare, consequential actions.

Action buttons fit their content: 2 rem minimum height, 0.875 rem text, 0.25 rem vertical and 0.75 rem horizontal padding. Labels wrap when space is limited.

Use fully rounded corners; important actions use 0.5 rem corners. Arrange controls with a 1 rem horizontal or 0.5 rem stacked gap.

Interaction colors follow the central HSL lightness rule described in Colors & themes. State colors and disabled opacity come from the shared stylesheet.

## Icon buttons

Compact circular actions with a clear accessible name.

```tsx
import { IconButton } from '@envsemble/ui';
import { ChevronRight } from '@envsemble/ui/icons';

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
import { Input } from '@envsemble/ui';

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
import { Textarea } from '@envsemble/ui';

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
import { Checkbox } from '@envsemble/ui';

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
import { Switch } from '@envsemble/ui';

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
import { RadioGroup, Radio } from '@envsemble/ui';

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
import { Select } from '@envsemble/ui';

<Select label="Visibility" name="visibility" value={visibility}
  onValueChange={setVisibility} options={[
    { value: 'team', label: 'Team' },
    { value: 'private', label: 'Private' },
  ]} />
```

- options: Array of { value, label, disabled? }
- value / defaultValue: Selected string, or null
- onValueChange: Receives selected string or null
- label / native participation: label, name, disabled, required

Use a select to save space when a single choice has several alternatives.

Use the tonal trigger, selected indication and grouped option geometry. Keyboard navigation, typeahead and dismissal come from the component.

## Navigation

Quiet destinations and a clear selected location.

```tsx
import { NavigationItem } from '@envsemble/ui';
import { Home } from '@envsemble/ui/icons';

<NavigationItem href="#/home" selected={page === 'home'}
  icon={<Home />} selectedIcon={<Home filled />}>
  Home
</NavigationItem>
```

- href: Renders a link; omit for a button action
- selected / disabled: Current destination and unavailable state
- icon / selectedIcon: Optional ordinary and selected icon content
- children / native props: Destination label and link/button attributes

The application owns routing and the selected destination. Use a meaningful destination label.

Unselected icons use the caption color; selected icon and label use the link color. Navigation fits its content with a 2.5 rem minimum height.

## Grouped rows

Connected content with generous outer corners and compact inner joins.

```tsx
import { GroupedRows, Row, Button } from '@envsemble/ui';

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
import { Card, ActionCard, FeatureCard, Button } from '@envsemble/ui';
import { Apps } from '@envsemble/ui/icons';

<FeatureCard icon={<Apps />} title="Connected workspace"
  description="Bring your team and tools together."
  action={<Button>Explore</Button>} />

<ActionCard title="Project overview" meta="Updated today"
  actions={<Button variant="outlined">Open project</Button>}>
  Shared context for the next release.
</ActionCard>
```

- Card: children, tone (row or pane) and native div props
- ActionCard: title, meta, children, actions
- FeatureCard: icon, title, description, action

Use 1.75 rem corners. Row tone is the standalone card fill; pane tone groups content in a quieter background.

The action strip derives its fill from the parent surface. Compose actions from the shared controls.

Titles, metadata and product data remain application content.

## Chips & notes

Metadata stays compact; optional guidance expands when needed.

```tsx
import { InfoChip, DisclosureNote } from '@envsemble/ui';

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
import { EmptyState, Button } from '@envsemble/ui';
import { Search } from '@envsemble/ui/icons';

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
import { LoadingState, Skeleton } from '@envsemble/ui';

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
import { Theme, Button, ToastProvider, useToast } from '@envsemble/ui';

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
import { Dialog, Button, Input } from '@envsemble/ui';

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

In the design-system repository, run npm install and npm run dev. The documentation workspace consumes the public package through the local workspace. Changes appear during development without publishing or changing the package version. A future product can use the same workspace connection; product integration is separate work. Adopt a published version intentionally with npm install @envsemble/ui@<version>, review CHANGELOG.md, and validate the consumer before release. Every release has a matching offline documentation HTML.
