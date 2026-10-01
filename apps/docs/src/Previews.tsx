import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import {
  Text,
  Theme,
  Button,
  IconButton,
  NavigationItem,
  DirectionLink,
  InfoChip,
  DisclosureNote,
  Card,
  Surface,
  FeatureCard,
  GroupedRows,
  Row,
  EmptyState,
  Skeleton,
  LoadingState,
  Input,
  Textarea,
  Checkbox,
  Switch,
  RadioGroup,
  Radio,
  Select,
  Tabs,
  Dialog,
  Toast,
  ToastProvider,
  useToast,
  Stack,
  ActionGroup,
  useTheme,
} from '@envsemble/envui';
import {
  Add,
  ChevronRight,
  Home,
  Search,
  Apps,
  Settings,
  ArrowBack,
  ArrowForward,
} from '@envsemble/envui/icons';
import { Example, Specimen, SpecimenGrid } from './Example';

type Appearance = 'light' | 'dark';
export function Paired({ children }: { children: (theme: Appearance) => ReactNode }) {
  const appearance = useTheme();
  const themes: Appearance[] = appearance === 'light' ? ['light', 'dark'] : ['dark', 'light'];
  const paneRef = useRef<HTMLDivElement>(null);
  const [rows, setRows] = useState(1);
  useLayoutEffect(() => {
    const panes = paneRef.current?.children;
    if (panes?.length) setRows(Math.max(...Array.from(panes, (pane) => pane.children.length)));
  });
  return (
    <div
      ref={paneRef}
      className="docs-paired"
      style={{ gridTemplateRows: `repeat(${rows}, auto)` }}
    >
      {themes.map((theme, index) => (
        <Theme
          key={theme}
          theme={theme}
          className="docs-preview"
          data-side={index === 0 ? 'left' : 'right'}
          style={{ gridRow: `1 / span ${rows}`, gridColumn: index + 1 }}
        >
          {children(theme)}
        </Theme>
      ))}
    </div>
  );
}
const variants = ['primary', 'important', 'secondary', 'outlined', 'destructive'] as const;
const states = ['Default', 'Hover', 'Pressed', 'Keyboard focus', 'Disabled'];
function ButtonMatrix({ iconOnly = false }: { iconOnly?: boolean }) {
  return (
    <div className="docs-matrix-scroll" tabIndex={0} aria-label="Control state comparison">
      <table className="docs-matrix">
        <thead>
          <tr>
            <th>Variant</th>
            {states.map((s) => (
              <th key={s}>{s}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(iconOnly ? ['Circular icon'] : variants).map((variant) => (
            <tr key={variant}>
              <th>{variant}</th>
              {states.map((s, i) => (
                <td key={s}>
                  {iconOnly ? (
                    <IconButton
                      className={`docs-force-${i}`}
                      disabled={i === 4}
                      aria-label="Next item"
                      icon={<ChevronRight />}
                    />
                  ) : (
                    <Button
                      variant={variant as (typeof variants)[number]}
                      className={`docs-force-${i}`}
                      disabled={i === 4}
                    >
                      {variant === 'destructive'
                        ? 'Delete'
                        : variant === 'important'
                          ? 'Confirm'
                          : variant === 'secondary'
                            ? 'Cancel'
                            : variant === 'outlined'
                              ? 'Manage'
                              : 'Continue'}
                    </Button>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ManagedControls() {
  const toast = useToast();
  return (
    <Stack>
      <ActionGroup>
        <Button
          onClick={() =>
            toast.show({ variant: 'success', message: 'Changes saved', placement: 'bottom-right' })
          }
        >
          Bottom right notice
        </Button>
        <Button
          variant="secondary"
          onClick={() =>
            toast.show({
              variant: 'info',
              message: 'A new version is available',
              placement: 'top-center',
            })
          }
        >
          Top center notice
        </Button>
        <Button
          variant="destructive"
          onClick={() =>
            toast.show({
              variant: 'error',
              message: 'Could not save changes',
              action: {
                label: 'Retry',
                onClick: () => toast.show({ variant: 'success', message: 'Changes saved' }),
              },
            })
          }
        >
          Persistent error
        </Button>
        <Button variant="secondary" onClick={() => toast.clear()}>
          Clear notices
        </Button>
      </ActionGroup>
      <Text variant="caption" className="docs-caption">
        Show several notices to explore the queue. Hover or focus a notice to pause its timer.
      </Text>
    </Stack>
  );
}
function ManagedToastExample() {
  return (
    <Example title="Managed delivery" className="docs-managed-toast" gap={5}>
      <Tabs
        aria-label="Notification appearance"
        defaultValue="light"
        items={(['light', 'dark'] as const).map((theme) => ({
          value: theme,
          button: <Button>{theme === 'light' ? 'Light' : 'Dark'} appearance</Button>,
          content: (
            <Theme theme={theme}>
              <Surface tone="canvas" padding={5}>
                <ToastProvider defaultPlacement="bottom-right">
                  <ManagedControls />
                </ToastProvider>
              </Surface>
            </Theme>
          ),
        }))}
      />
    </Example>
  );
}

export function ComponentPreview({ id }: { id: string }) {
  const [empty, setEmpty] = useState('');
  const [name, setName] = useState('Autumn release');
  const [description, setDescription] = useState('Shared plans for the next release.');
  const [checked, setChecked] = useState(false);
  const [mixed, setMixed] = useState<boolean | 'mixed'>('mixed');
  const [enabled, setEnabled] = useState(true);
  const [access, setAccess] = useState('team');
  const [count, setCount] = useState('3');
  const [selected, setSelected] = useState('Home');
  const [tabView, setTabView] = useState<string | null>('preview');
  const [tabStyle, setTabStyle] = useState<string | null>('secondary');
  const [tabIcon, setTabIcon] = useState<string | null>('home');
  const [tabNavigation, setTabNavigation] = useState<string | null>('home');
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [dialog, setDialog] = useState<{ theme: Appearance; kind: 'create' | 'delete' } | null>(
    null,
  );
  const [confirmation, setConfirmation] = useState('');
  return (
    <>
      <Paired>
        {(theme) => {
          switch (id) {
            case 'surface':
              return (
                <>
                  <Example
                    title="Surface with explicit layout"
                    caption="Surface owns fill, padding and corners; Stack owns the gap."
                  >
                    <Surface tone="pane" padding={5} render={<Stack gap={5} />}>
                      <Text as="h3" variant="section-heading">
                        Workspace pane
                      </Text>
                      <Text tone="muted">Compose content with the spacing it needs.</Text>
                      <ActionGroup>
                        <Button>Continue</Button>
                        <Button variant="secondary">Cancel</Button>
                      </ActionGroup>
                    </Surface>
                  </Example>
                  <Example
                    title="Surface and Card"
                    caption="Surface sets appearance; Card also spaces its contents."
                    size="collection"
                  >
                    <SpecimenGrid size="card">
                      <Surface tone="row">
                        <Text as="h3" variant="section-heading">
                          Plain surface
                        </Text>
                        <Text tone="muted">No automatic gap between these blocks.</Text>
                      </Surface>
                      <Card>
                        <Text as="h3" variant="section-heading">
                          Content card
                        </Text>
                        <Text tone="muted">The card spaces its direct children.</Text>
                      </Card>
                    </SpecimenGrid>
                  </Example>
                  <Example title="Tones and corners" size="collection">
                    <SpecimenGrid size="compact">
                      <Surface tone="pane" padding={4}>
                        <Text>Pane · outer corners</Text>
                      </Surface>
                      <Surface tone="alternate" padding={4} corners="standard">
                        <Text>Alternate · standard corners</Text>
                      </Surface>
                      <Surface tone="row" padding={4} corners="pill">
                        <Text>Row · pill corners</Text>
                      </Surface>
                    </SpecimenGrid>
                  </Example>
                </>
              );
            case 'layout':
              return (
                <>
                  <Example
                    title="Content spacing"
                    caption="Stack uses 1 rem between related blocks."
                    size="field"
                  >
                    <Stack>
                      <Input
                        label="Project name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                      <Input
                        label="Supporting detail"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                      <DisclosureNote title="Optional guidance">
                        <Text>Keep external spacing in the parent layout.</Text>
                      </DisclosureNote>
                    </Stack>
                  </Example>
                  <Example title="Action rows" caption="1 rem gap; actions wrap when needed.">
                    <ActionGroup>
                      <Button variant="secondary">Cancel</Button>
                      <Button>Save changes</Button>
                    </ActionGroup>
                  </Example>
                  <Example
                    title="Stacked actions"
                    caption="0.5 rem gap; label buttons fill the group."
                  >
                    <ActionGroup stacked className="docs-narrow-actions">
                      <Button>Save changes</Button>
                      <Button variant="secondary">Cancel</Button>
                    </ActionGroup>
                  </Example>
                </>
              );
            case 'buttons':
              return (
                <>
                  <Example title="Variants & states" size="wide">
                    <ButtonMatrix />
                  </Example>
                  <Example title="Labels & icons">
                    <ActionGroup>
                      <Button onClick={() => setConfirmation('Item created')}>Create item</Button>
                      <Button startIcon={<Add />} onClick={() => setConfirmation('Item created')}>
                        Create item
                      </Button>
                      <Button endIcon={<ChevronRight />}>Continue</Button>
                    </ActionGroup>
                  </Example>
                  <Example title="Destinations">
                    <ActionGroup>
                      <Button href="#/components/cards/preview" variant="outlined">
                        Explore cards
                      </Button>
                      <Button href="#/components/cards/preview" variant="outlined" disabled>
                        Unavailable destination
                      </Button>
                    </ActionGroup>
                  </Example>
                  <Example title="Grouped actions">
                    <ActionGroup>
                      <Button variant="secondary" onClick={() => setConfirmation('Cancelled')}>
                        Cancel
                      </Button>
                      <Button onClick={() => setConfirmation('Changes saved')}>Save changes</Button>
                    </ActionGroup>
                    <ActionGroup stacked className="docs-narrow-actions">
                      <Button onClick={() => setConfirmation('Changes saved')}>Save changes</Button>
                      <Button variant="secondary">Cancel</Button>
                    </ActionGroup>
                    <Text variant="caption" className="docs-caption" aria-live="polite">
                      {confirmation || 'One primary action per group'}
                    </Text>
                  </Example>
                </>
              );
            case 'icon-buttons':
              return (
                <>
                  <Example title="Circular control & states" size="wide">
                    <ButtonMatrix iconOnly />
                  </Example>
                  <Example title="With related actions">
                    <ActionGroup>
                      <Button startIcon={<Add />}>Create item</Button>
                      <IconButton
                        icon={<ChevronRight />}
                        aria-label="Next item"
                        onClick={() => setConfirmation('Moved to next item')}
                      />
                      <IconButton icon={<Settings />} aria-label="Settings" />
                    </ActionGroup>
                    <Text variant="caption" className="docs-caption" aria-live="polite">
                      {confirmation}
                    </Text>
                  </Example>
                </>
              );
            case 'input':
              return (
                <>
                  <Example title="Interactive field" size="field">
                    <Input
                      label="Project name"
                      name={`project-${theme}`}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      hint="A name your team will recognize."
                    />
                  </Example>
                  <Example title="Empty, filled & focus" size="collection">
                    <SpecimenGrid>
                      <Specimen title="Empty">
                        <Input
                          label="Project name"
                          placeholder="Enter a name"
                          value={empty}
                          onChange={(e) => setEmpty(e.target.value)}
                        />
                      </Specimen>
                      <Specimen title="Filled">
                        <Input
                          label="Project name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </Specimen>
                      <Specimen title="Keyboard focus">
                        <Input
                          label="Project name"
                          className="docs-force-3"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </Specimen>
                    </SpecimenGrid>
                  </Example>
                  <Example title="Validation & availability" size="collection">
                    <SpecimenGrid>
                      <Specimen title="Invalid">
                        <Input
                          label="Project name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          error="Choose a unique project name."
                        />
                      </Specimen>
                      <Specimen title="Read only" caption="readOnly">
                        <Input label="Project name" value="Workspace default" readOnly />
                      </Specimen>
                      <Specimen title="Disabled" caption="disabled">
                        <Input label="Project name" value="Unavailable" disabled />
                      </Specimen>
                    </SpecimenGrid>
                  </Example>
                </>
              );
            case 'textarea':
              return (
                <>
                  <Example title="Interactive description" size="field">
                    <Textarea
                      label="Description"
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      hint="Explain what this project is for."
                    />
                  </Example>
                  <Example title="States & validation" size="collection">
                    <SpecimenGrid>
                      <Specimen title="Empty">
                        <Textarea
                          label="Description"
                          rows={2}
                          value={empty}
                          onChange={(e) => setEmpty(e.target.value)}
                        />
                      </Specimen>
                      <Specimen title="Keyboard focus">
                        <Textarea
                          label="Description"
                          className="docs-force-3"
                          rows={2}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                        />
                      </Specimen>
                      <Specimen title="Invalid">
                        <Textarea
                          label="Description"
                          rows={3}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          error="Add the intended outcome."
                        />
                      </Specimen>
                      <Specimen title="Read only" caption="readOnly">
                        <Textarea
                          label="Description"
                          rows={2}
                          readOnly
                          value="Provided by the workspace."
                        />
                      </Specimen>
                      <Specimen title="Disabled" caption="disabled">
                        <Textarea label="Description" rows={2} disabled value="Unavailable" />
                      </Specimen>
                    </SpecimenGrid>
                  </Example>
                </>
              );
            case 'checkbox':
              return (
                <>
                  <Example title="Independent selection" size="collection">
                    <SpecimenGrid size="compact">
                      <Specimen title="Interactive choices">
                        <Stack>
                          <Checkbox
                            label="Include archived items"
                            checked={checked}
                            onCheckedChange={setChecked}
                          />
                          <Checkbox
                            label="Selected choice"
                            checked={!checked}
                            onCheckedChange={(next) => setChecked(!next)}
                          />
                        </Stack>
                      </Specimen>
                      <Specimen title="Disabled choices">
                        <Stack>
                          <Checkbox label="Include archived items" disabled />
                          <Checkbox label="Include completed items" checked disabled />
                        </Stack>
                      </Specimen>
                    </SpecimenGrid>
                  </Example>
                  <Example title="Partial selection" size="compact">
                    <Stack>
                      <Checkbox label="All projects" checked={mixed} onCheckedChange={setMixed} />
                      <Button variant="secondary" onClick={() => setMixed('mixed')}>
                        Restore partial selection
                      </Button>
                    </Stack>
                  </Example>
                </>
              );
            case 'switch':
              return (
                <Example title="On, off & disabled" size="collection">
                  <SpecimenGrid size="compact">
                    <Specimen title="Interactive settings">
                      <Stack>
                        <Switch
                          label="Enable notifications"
                          checked={enabled}
                          onCheckedChange={setEnabled}
                        />
                        <Switch
                          label="Enable summaries"
                          checked={!enabled}
                          onCheckedChange={(next) => setEnabled(!next)}
                        />
                      </Stack>
                    </Specimen>
                    <Specimen title="Disabled settings">
                      <Stack>
                        <Switch label="Enable notifications" disabled />
                        <Switch label="Enable summaries" checked disabled />
                      </Stack>
                    </Specimen>
                  </SpecimenGrid>
                </Example>
              );
            case 'radio':
              return (
                <>
                  <Example title="Inline choices" size="field">
                    <RadioGroup
                      label="Access"
                      name={`access-inline-${theme}`}
                      value={access}
                      onValueChange={setAccess}
                    >
                      <Radio value="team" label="Team" />
                      <Radio value="private" label="Private" />
                      <Radio value="unavailable" label="Unavailable" disabled />
                    </RadioGroup>
                  </Example>
                  <Example title="Selectable rows">
                    <RadioGroup
                      label="Project visibility"
                      name={`access-rows-${theme}`}
                      value={access}
                      onValueChange={setAccess}
                      variant="rows"
                    >
                      <Radio value="team" label="Team" detail="Everyone in your workspace" />
                      <Radio value="private" label="Private" detail="Only invited people" />
                      <Radio
                        value="unavailable"
                        label="Public"
                        detail="Unavailable for this workspace"
                        disabled
                      />
                    </RadioGroup>
                  </Example>
                  <Example title="Disabled group" size="field">
                    <RadioGroup
                      label="Inherited access"
                      name={`access-disabled-${theme}`}
                      value="team"
                      disabled
                    >
                      <Radio value="team" label="Team" />
                      <Radio value="private" label="Private" />
                    </RadioGroup>
                  </Example>
                </>
              );
            case 'select':
              return (
                <Example title="Selection, validation & availability" size="collection">
                  <SpecimenGrid>
                    <Specimen title="Interactive">
                      <Select
                        label="Visibility"
                        hint="Choose who can open the project."
                        name={`visibility-${theme}`}
                        value={access}
                        onValueChange={(v) => setAccess(v ?? 'team')}
                        options={[
                          { value: 'team', label: 'Team' },
                          { value: 'private', label: 'Private' },
                          { value: 'public', label: 'Public (unavailable)', disabled: true },
                        ]}
                      />
                    </Specimen>
                    <Specimen title="Required choice">
                      <Select
                        label="Project owner"
                        required
                        name={`owner-${theme}`}
                        placeholder="Choose an owner"
                        value={empty || null}
                        onValueChange={(value) => setEmpty(value ?? '')}
                        error={!empty ? 'Choose an owner to continue.' : undefined}
                        options={[
                          { value: 'you', label: 'You' },
                          { value: 'team', label: 'Team' },
                        ]}
                      />
                    </Specimen>
                    <Specimen title="Disabled" caption="disabled">
                      <Select
                        label="Inherited visibility"
                        value="team"
                        disabled
                        options={[
                          { value: 'team', label: 'Team' },
                          { value: 'private', label: 'Private' },
                        ]}
                      />
                    </Specimen>
                  </SpecimenGrid>
                </Example>
              );
            case 'navigation':
              return (
                <>
                  <Example title="Destination selection" size="compact">
                    <Stack>
                      {['Home', 'Projects', 'Settings'].map((label, i) => (
                        <NavigationItem
                          key={label}
                          selected={selected === label}
                          onClick={() => setSelected(label)}
                          icon={i === 0 ? <Home /> : i === 1 ? <Apps /> : <Settings />}
                        >
                          {label}
                        </NavigationItem>
                      ))}
                    </Stack>
                  </Example>
                  <Example title="States" size="collection">
                    <SpecimenGrid size="compact">
                      <Specimen title="Default">
                        <NavigationItem icon={<Home />}>Home</NavigationItem>
                      </Specimen>
                      <Specimen title="Selected">
                        <NavigationItem icon={<Home />} selected>
                          Home
                        </NavigationItem>
                      </Specimen>
                      <Specimen title="Hover">
                        <NavigationItem icon={<Home />} className="docs-force-1">
                          Home
                        </NavigationItem>
                      </Specimen>
                      <Specimen title="Pressed">
                        <NavigationItem icon={<Home />} className="docs-force-2">
                          Home
                        </NavigationItem>
                      </Specimen>
                      <Specimen title="Keyboard focus">
                        <NavigationItem icon={<Home />} className="docs-force-3">
                          Home
                        </NavigationItem>
                      </Specimen>
                      <Specimen title="Disabled">
                        <NavigationItem icon={<Home />} disabled>
                          Home
                        </NavigationItem>
                      </Specimen>
                    </SpecimenGrid>
                  </Example>
                </>
              );
            case 'tabs':
              return (
                <>
                  <Example title="Content views" size="content">
                    <Tabs
                      aria-label="Example reference views"
                      value={tabView}
                      onValueChange={setTabView}
                      keepMounted
                      items={[
                        {
                          value: 'preview',
                          button: <Button>Preview</Button>,
                          content: (
                            <Card>
                              <Text as="h3" variant="section-heading">
                                Live preview
                              </Text>
                              <Text>Explore the component in use.</Text>
                            </Card>
                          ),
                        },
                        {
                          value: 'guidelines',
                          button: <Button>Guidelines</Button>,
                          content: (
                            <Card>
                              <Text as="h3" variant="section-heading">
                                Design guidelines
                              </Text>
                              <Text>Use the shared colors, spacing and motion.</Text>
                            </Card>
                          ),
                        },
                        {
                          value: 'usage',
                          button: <Button>Usage</Button>,
                          content: (
                            <Card>
                              <Text as="h3" variant="section-heading">
                                React usage
                              </Text>
                              <Text>Import Tabs and supply buttons with their content.</Text>
                            </Card>
                          ),
                        },
                      ]}
                    />
                  </Example>
                  <Example title="Button styles" caption="The selected tab keeps its button style.">
                    <Tabs
                      aria-label="Button style examples"
                      value={tabStyle}
                      onValueChange={setTabStyle}
                      items={[
                        {
                          value: 'secondary',
                          button: <Button variant="secondary">Secondary</Button>,
                          content: <Card>Secondary button fill and border.</Card>,
                        },
                        {
                          value: 'outlined',
                          button: <Button variant="outlined">Outlined</Button>,
                          content: <Card>Outlined button fill, label and border.</Card>,
                        },
                        {
                          value: 'important',
                          button: <Button variant="important">Important</Button>,
                          content: <Card>Important button color and standard corners.</Card>,
                        },
                        {
                          value: 'unavailable',
                          button: <Button disabled>Unavailable</Button>,
                          content: null,
                        },
                      ]}
                    />
                  </Example>
                  <Example title="Icon buttons" caption="Accessible names identify each view.">
                    <Tabs
                      aria-label="Icon views"
                      value={tabIcon}
                      onValueChange={setTabIcon}
                      items={[
                        {
                          value: 'home',
                          button: <IconButton icon={<Home />} aria-label="Home view" />,
                          content: <Card>Home content</Card>,
                        },
                        {
                          value: 'search',
                          button: <IconButton icon={<Search />} aria-label="Search view" />,
                          content: <Card>Search content</Card>,
                        },
                        {
                          value: 'settings',
                          button: <IconButton icon={<Settings />} aria-label="Settings view" />,
                          content: <Card>Settings content</Card>,
                        },
                      ]}
                    />
                  </Example>
                  <Example title="Navigation buttons" caption="Tabs owns selection and icon fill.">
                    <Tabs
                      aria-label="Workspace views"
                      value={tabNavigation}
                      onValueChange={setTabNavigation}
                      items={[
                        {
                          value: 'home',
                          button: <NavigationItem icon={<Home />}>Home</NavigationItem>,
                          content: <Card>Workspace overview</Card>,
                        },
                        {
                          value: 'projects',
                          button: <NavigationItem icon={<Apps />}>Projects</NavigationItem>,
                          content: <Card>Workspace projects</Card>,
                        },
                      ]}
                    />
                  </Example>
                </>
              );
            case 'direction-links':
              return (
                <>
                  <Example title="Previous & up next">
                    <ActionGroup>
                      <DirectionLink
                        direction="previous"
                        href="#/foundations/typography"
                        icon={<ArrowBack />}
                      >
                        Typography
                      </DirectionLink>
                      <DirectionLink
                        direction="next"
                        href="#/foundations/spacing"
                        icon={<ArrowForward />}
                      >
                        Spacing & shape
                      </DirectionLink>
                    </ActionGroup>
                  </Example>
                  <Example title="Without an icon">
                    <DirectionLink direction="next" href="#/getting-started">
                      Getting started
                    </DirectionLink>
                  </Example>
                  <Example title="Long destination text">
                    <div className="docs-narrow-actions">
                      <DirectionLink
                        direction="next"
                        href="#/foundations/motion"
                        icon={<ArrowForward />}
                      >
                        Motion & accessibility across the component library
                      </DirectionLink>
                    </div>
                  </Example>
                </>
              );
            case 'rows':
              return (
                <>
                  <Example title="One to five rows">
                    <Select
                      label="Row count"
                      value={count}
                      onValueChange={(v) => setCount(v ?? '3')}
                      options={['1', '2', '3', '4', '5'].map((value) => ({
                        value,
                        label: `${value} ${value === '1' ? 'row' : 'rows'}`,
                      }))}
                    />
                    <GroupedRows>
                      {Array.from({ length: Number(count) }, (_, i) => (
                        <Row
                          key={i}
                          title={`Setting ${i + 1}`}
                          detail="Supporting detail"
                          action={
                            <Button
                              variant="outlined"
                              onClick={() => setConfirmation(`Managing setting ${i + 1}`)}
                            >
                              Manage
                            </Button>
                          }
                        />
                      ))}
                    </GroupedRows>
                    <Text variant="caption" className="docs-caption" aria-live="polite">
                      {confirmation}
                    </Text>
                  </Example>
                  <Example title="Alternate background">
                    <GroupedRows contrast>
                      <Row
                        title="Notifications"
                        detail="Delivery preferences"
                        action={
                          <Switch
                            label="Enable notifications"
                            checked={enabled}
                            onCheckedChange={setEnabled}
                          />
                        }
                      />
                      <Row
                        title="Workspace access"
                        detail="People and permissions"
                        action={
                          <IconButton
                            icon={<ChevronRight />}
                            aria-label="Manage workspace access"
                          />
                        }
                      />
                    </GroupedRows>
                  </Example>
                </>
              );
            case 'cards':
              return (
                <>
                  <Example title="Content & actions" size="collection">
                    <SpecimenGrid size="card">
                      <Specimen title="Content card">
                        <Card>
                          <Text as="h3" variant="section-heading">
                            Project overview
                          </Text>
                          <Text tone="muted">Planning and progress for the autumn release.</Text>
                          <InfoChip>Updated today</InfoChip>
                        </Card>
                      </Specimen>
                      <Specimen title="Action strip">
                        <Card
                          as="article"
                          layout="action"
                          heading="Autumn release"
                          meta="Updated today"
                          actions={
                            <>
                              <Button variant="secondary">Share</Button>
                              <Button variant="outlined">Open project</Button>
                            </>
                          }
                        >
                          <Text tone="muted">Shared context for the next release.</Text>
                        </Card>
                      </Specimen>
                    </SpecimenGrid>
                  </Example>
                  <Example title="Interactive cards" size="collection">
                    <SpecimenGrid size="card">
                      <Specimen title="Destination">
                        <Card href="#/overview">
                          <Text as="h3" variant="section-heading">
                            Component overview
                          </Text>
                          <Text tone="muted">Browse the component catalogue.</Text>
                        </Card>
                      </Specimen>
                      <Specimen title="Action">
                        <Card
                          as="button"
                          onClick={() => setExpanded(!expanded)}
                          aria-expanded={expanded}
                        >
                          <Text as="span" variant="section-heading">
                            {expanded ? 'Hide details' : 'Show details'}
                          </Text>
                          <Text as="span" tone="muted">
                            {expanded
                              ? 'Your team and tools share one workspace.'
                              : 'Project details are available.'}
                          </Text>
                        </Card>
                      </Specimen>
                      <Specimen title="Disabled">
                        <Card as="button" disabled>
                          <Text as="span">Workspace unavailable</Text>
                        </Card>
                      </Specimen>
                    </SpecimenGrid>
                  </Example>
                  <Example title="Feature composition" size="wide">
                    <FeatureCard
                      icon={<Apps />}
                      title="Connected workspace"
                      description="Bring your team and tools together."
                      action={<Button>Explore</Button>}
                    />
                  </Example>
                  <Example title="Compact feature" size="field">
                    <FeatureCard
                      icon={<Apps />}
                      title="Connected workspace"
                      description="Bring your team and tools together."
                      action={<Button>Explore</Button>}
                    />
                  </Example>
                </>
              );
            case 'chips':
              return (
                <Example title="Metadata">
                  <ActionGroup>
                    <InfoChip>Optional</InfoChip>
                    <InfoChip>Read only</InfoChip>
                    <InfoChip>3 members</InfoChip>
                  </ActionGroup>
                </Example>
              );
            case 'disclosures':
              return (
                <Example title="Optional guidance">
                  <DisclosureNote
                    title="How visibility works"
                    open={expanded}
                    onToggle={(e) => setExpanded(e.currentTarget.open)}
                  >
                    <Text>
                      Team projects are available to every workspace member. Private projects are
                      visible only to invited people.
                    </Text>
                  </DisclosureNote>
                </Example>
              );
            case 'empty-state':
              return (
                <Example title="Empty content" size="collection">
                  <SpecimenGrid size="card">
                    <Specimen title="First project">
                      <EmptyState
                        icon={<Apps />}
                        title="No projects yet"
                        description="Create a project to bring plans and people together."
                        action={
                          <Button
                            startIcon={<Add />}
                            onClick={() => setConfirmation('Project creation started')}
                          >
                            Create project
                          </Button>
                        }
                      />
                    </Specimen>
                    <Specimen title="No search results">
                      <EmptyState
                        icon={<Search />}
                        title="No matching projects"
                        description="Try another name or clear the filters."
                        action={
                          <Button
                            variant="secondary"
                            onClick={() => setConfirmation('Filters cleared')}
                          >
                            Clear filters
                          </Button>
                        }
                      />
                    </Specimen>
                  </SpecimenGrid>
                  <Text variant="caption" className="docs-caption" aria-live="polite">
                    {confirmation}
                  </Text>
                </Example>
              );
            case 'loading':
              return (
                <Example title="Loading placeholders" size="collection">
                  <SpecimenGrid size="card">
                    <Specimen title="Content card">
                      <Card>
                        <LoadingState label="Loading project">
                          <Stack gap={2}>
                            <Skeleton width="38%" height="1.25rem" />
                            <Skeleton width="100%" height="0.8rem" />
                            <Skeleton width="72%" height="0.8rem" />
                          </Stack>
                        </LoadingState>
                      </Card>
                    </Specimen>
                    <Specimen title="Rows">
                      <LoadingState label="Loading settings">
                        <Stack>
                          {[1, 2, 3].map((i) => (
                            <Skeleton key={i} width="100%" height="3.5rem" />
                          ))}
                        </Stack>
                      </LoadingState>
                    </Specimen>
                  </SpecimenGrid>
                </Example>
              );
            case 'toasts':
              return (
                <>
                  <Example title="Manual notices">
                    <Stack>
                      {(['neutral', 'success', 'info', 'error'] as const)
                        .filter((v) => !dismissed.includes(v))
                        .map((v) => (
                          <Toast
                            key={v}
                            announce={false}
                            variant={v}
                            message={
                              v === 'neutral'
                                ? 'Changes saved'
                                : v === 'success'
                                  ? 'Project created'
                                  : v === 'info'
                                    ? 'A new version is available'
                                    : 'Could not save changes'
                            }
                            action={
                              v === 'error'
                                ? {
                                    label: 'Retry',
                                    onClick: () => setConfirmation('Retry requested'),
                                  }
                                : undefined
                            }
                            onDismiss={() => setDismissed((prev) => [...prev, v])}
                          />
                        ))}
                      <Button variant="secondary" onClick={() => setDismissed([])}>
                        Restore examples
                      </Button>
                      <Text variant="caption" className="docs-caption" aria-live="polite">
                        {confirmation}
                      </Text>
                    </Stack>
                  </Example>
                </>
              );
            case 'dialogs':
              return (
                <Example title="Modal dialogs" size="collection">
                  <SpecimenGrid size="compact">
                    <Specimen title="Confirmation">
                      <Dialog
                        open={dialog?.theme === theme && dialog.kind === 'delete'}
                        onOpenChange={(open) => setDialog(open ? { theme, kind: 'delete' } : null)}
                        trigger={<Button variant="destructive">Delete project</Button>}
                        title="Delete project?"
                        description="This removes the project for everyone in the workspace."
                        closeLabel="Cancel"
                        actions={
                          <Button
                            variant="destructive"
                            onClick={() => {
                              setDialog(null);
                              setConfirmation('Project deleted');
                            }}
                          >
                            Delete project
                          </Button>
                        }
                      />
                    </Specimen>
                    <Specimen title="Form">
                      <Dialog
                        open={dialog?.theme === theme && dialog.kind === 'create'}
                        onOpenChange={(open) => setDialog(open ? { theme, kind: 'create' } : null)}
                        trigger={<Button startIcon={<Add />}>Create project</Button>}
                        title="Create project"
                        description="Choose a name your team will recognize."
                        closeLabel="Cancel"
                        actions={
                          <Button
                            onClick={() => {
                              setDialog(null);
                              setConfirmation(`Created ${name || 'project'}`);
                            }}
                          >
                            Create
                          </Button>
                        }
                      >
                        <Input
                          label="Project name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </Dialog>
                    </Specimen>
                  </SpecimenGrid>
                  <Text variant="caption" className="docs-caption" aria-live="polite">
                    {confirmation}
                  </Text>
                </Example>
              );
            default:
              return null;
          }
        }}
      </Paired>
      {id === 'toasts' && <ManagedToastExample />}
    </>
  );
}
