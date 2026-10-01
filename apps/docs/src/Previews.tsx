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
import { Example } from './Example';

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
              <Card tone="canvas" padding={5}>
                <ToastProvider defaultPlacement="bottom-right">
                  <ManagedControls />
                </ToastProvider>
              </Card>
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
  const [dialogTheme, setDialogTheme] = useState<Appearance | null>(null);
  const [resetVersion, setResetVersion] = useState(0);
  const [confirmation, setConfirmation] = useState('');
  const reset = () => {
    setResetVersion((value) => value + 1);
    setEmpty('');
    setName('Autumn release');
    setDescription('Shared plans for the next release.');
    setChecked(false);
    setMixed('mixed');
    setEnabled(true);
    setAccess('team');
    setCount('3');
    setSelected('Home');
    setTabView('preview');
    setTabStyle('secondary');
    setTabIcon('home');
    setTabNavigation('home');
    setExpanded(false);
    setDismissed([]);
    setDialogTheme(null);
    setConfirmation('');
  };
  return (
    <>
      <div className="docs-preview-toolbar">
        <span>Examples share their state across both themes.</span>
        <Button variant="secondary" onClick={reset}>
          Reset examples
        </Button>
      </div>
      <Paired>
        {(theme) => {
          switch (id) {
            case 'text':
              return (
                <>
                  <Example title="Typography scale">
                    <Stack>
                      <Text as="h3" variant="page-heading">
                        Page heading
                      </Text>
                      <Text as="h4" variant="section-heading">
                        Section heading
                      </Text>
                      <Text>Body text for the main content.</Text>
                      <Text variant="supporting">Supporting text adds context.</Text>
                      <Text variant="caption">A caption describes the specimen.</Text>
                    </Stack>
                  </Example>
                  <Example title="Color and semantics">
                    <Stack>
                      <Text tone="muted">Body text with muted color.</Text>
                      <Text tone="quiet">Body text with quiet color.</Text>
                      <Text>
                        Native inline{' '}
                        <Text as="span" tone="muted">
                          supporting context
                        </Text>{' '}
                        keeps its surrounding paragraph semantics.
                      </Text>
                    </Stack>
                  </Example>
                </>
              );
            case 'layout':
              return (
                <>
                  <Example
                    title="Content spacing"
                    caption="Stack uses 1 rem between related blocks."
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
                        <p>Keep external spacing in the parent layout.</p>
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
                  <Example title="Variants & states">
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
                  <Example title="Circular control & states">
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
                  <Example title="Interactive field">
                    <Input
                      label="Project name"
                      name={`project-${theme}`}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      hint="A name your team will recognize."
                    />
                  </Example>
                  <Example title="Empty & filled">
                    <Stack>
                      <Input
                        label="Empty field"
                        placeholder="Enter a name"
                        value={empty}
                        onChange={(e) => setEmpty(e.target.value)}
                      />
                      <Input
                        label="Filled field"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                      <Input
                        label="Keyboard focus"
                        className="docs-force-3"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </Stack>
                  </Example>
                  <Example title="Validation & availability">
                    <Stack>
                      <Input
                        label="Invalid field"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        error="Choose a unique project name."
                      />
                      <Input label="Read-only field" value="Workspace default" readOnly />
                      <Input label="Disabled field" value="Unavailable" disabled />
                    </Stack>
                  </Example>
                </>
              );
            case 'textarea':
              return (
                <>
                  <Example title="Interactive description">
                    <Textarea
                      label="Description"
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      hint="Explain what this project is for."
                    />
                  </Example>
                  <Example title="Validation & availability">
                    <Stack>
                      <Textarea
                        label="Empty description"
                        rows={2}
                        value={empty}
                        onChange={(e) => setEmpty(e.target.value)}
                      />
                      <Textarea
                        label="Keyboard focus"
                        className="docs-force-3"
                        rows={2}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                      <Textarea
                        label="Invalid description"
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        error="Add the intended outcome."
                      />
                      <Textarea
                        label="Read-only description"
                        rows={2}
                        readOnly
                        value="Provided by the workspace."
                      />
                      <Textarea
                        label="Disabled description"
                        rows={2}
                        disabled
                        value="Unavailable"
                      />
                    </Stack>
                  </Example>
                </>
              );
            case 'checkbox':
              return (
                <>
                  <Example title="Independent selection">
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
                      <Checkbox label="Disabled choice" disabled />
                      <Checkbox label="Disabled selected choice" checked disabled />
                    </Stack>
                  </Example>
                  <Example title="Partial selection">
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
                <Example title="On, off & disabled">
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
                    <Switch label="Disabled setting" disabled />
                    <Switch label="Disabled enabled setting" checked disabled />
                  </Stack>
                </Example>
              );
            case 'radio':
              return (
                <>
                  <Example title="Inline choices">
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
                  <Example title="Disabled group">
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
                <>
                  <Example title="Interactive selection">
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
                  </Example>
                  <Example title="Field validation">
                    <Select
                      label="Project owner"
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
                  </Example>
                  <Example title="Disabled selection">
                    <Select
                      label="Inherited visibility"
                      value="team"
                      disabled
                      options={[
                        { value: 'team', label: 'Team' },
                        { value: 'private', label: 'Private' },
                      ]}
                    />
                  </Example>
                </>
              );
            case 'navigation':
              return (
                <>
                  <Example title="Destination selection">
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
                  <Example title="States">
                    <Stack>
                      <NavigationItem icon={<Home />}>Home</NavigationItem>
                      <NavigationItem icon={<Home />} selected>
                        Selected destination
                      </NavigationItem>
                      <NavigationItem icon={<Home />} className="docs-force-1">
                        Hover
                      </NavigationItem>
                      <NavigationItem icon={<Home />} className="docs-force-2">
                        Pressed
                      </NavigationItem>
                      <NavigationItem icon={<Home />} className="docs-force-3">
                        Keyboard focus
                      </NavigationItem>
                      <NavigationItem icon={<Home />} disabled>
                        Disabled destination
                      </NavigationItem>
                    </Stack>
                  </Example>
                </>
              );
            case 'tabs':
              return (
                <>
                  <Example title="Content views">
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
                              <h3>Live preview</h3>
                              <p>Explore the component in use.</p>
                            </Card>
                          ),
                        },
                        {
                          value: 'guidelines',
                          button: <Button>Guidelines</Button>,
                          content: (
                            <Card>
                              <h3>Design guidelines</h3>
                              <p>Use the shared colors, spacing and motion.</p>
                            </Card>
                          ),
                        },
                        {
                          value: 'usage',
                          button: <Button>Usage</Button>,
                          content: (
                            <Card>
                              <h3>React usage</h3>
                              <p>Import Tabs and supply buttons with their content.</p>
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
                    <>
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
                    </>
                    <Text variant="caption" className="docs-caption" aria-live="polite">
                      {confirmation}
                    </Text>
                  </Example>
                  <Example title="Alternate background">
                    <Card>
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
                    </Card>
                  </Example>
                </>
              );
            case 'cards':
              return (
                <>
                  <Example title="Clickable destination">
                    <Card href="#/overview">
                      <h3>Component overview</h3>
                      <p>Open the catalogue from anywhere on this card.</p>
                    </Card>
                  </Example>
                  <Example title="Clickable action">
                    <Card
                      as="button"
                      onClick={() => setExpanded(!expanded)}
                      aria-expanded={expanded}
                    >
                      <span>{expanded ? 'Hide details' : 'Show details'}</span>
                      <span>
                        {expanded
                          ? 'Your team and tools share one workspace.'
                          : 'Activate this card to reveal more context.'}
                      </span>
                    </Card>
                  </Example>
                  <Example title="Disabled card">
                    <Card as="button" disabled>
                      <span>Workspace unavailable</span>
                    </Card>
                  </Example>
                  <Example title="General surface">
                    <Card>
                      <h3>Project overview</h3>
                      <p>Related information lives together in a rounded surface.</p>
                      <InfoChip>Updated today</InfoChip>
                    </Card>
                  </Example>
                  <Example title="Action strip">
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
                      Shared context for the next release.
                    </Card>
                  </Example>
                  <Example title="Feature composition">
                    <FeatureCard
                      icon={<Apps />}
                      title="Connected workspace"
                      description="Bring your team and tools together."
                      action={<Button>Explore</Button>}
                    />
                  </Example>
                </>
              );
            case 'notes':
              return (
                <>
                  <Example title="Metadata">
                    <ActionGroup>
                      <InfoChip>Optional</InfoChip>
                      <InfoChip>Read only</InfoChip>
                      <InfoChip>3 members</InfoChip>
                    </ActionGroup>
                  </Example>
                  <Example title="Optional guidance">
                    <DisclosureNote
                      title="How visibility works"
                      open={expanded}
                      onToggle={(e) => setExpanded(e.currentTarget.open)}
                    >
                      <p>
                        Team projects are available to every workspace member. Private projects are
                        visible only to invited people.
                      </p>
                    </DisclosureNote>
                  </Example>
                </>
              );
            case 'empty-state':
              return (
                <>
                  <Example title="First project">
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
                  </Example>
                  <Example title="No search results">
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
                    <Text variant="caption" className="docs-caption" aria-live="polite">
                      {confirmation}
                    </Text>
                  </Example>
                </>
              );
            case 'loading':
              return (
                <>
                  <Example title="Content placeholders">
                    <Card>
                      <LoadingState label="Loading project">
                        <Stack gap={2}>
                          <Skeleton width="38%" height="1.25rem" />
                          <Skeleton width="100%" height="0.8rem" />
                          <Skeleton width="72%" height="0.8rem" />
                        </Stack>
                      </LoadingState>
                    </Card>
                  </Example>
                  <Example title="Row placeholders">
                    <LoadingState label="Loading settings">
                      <Stack>
                        {[1, 2, 3].map((i) => (
                          <Skeleton key={i} width="100%" height="3.5rem" />
                        ))}
                      </Stack>
                    </LoadingState>
                  </Example>
                </>
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
                <>
                  <Example title="Confirmation composition">
                    <Card>
                      <Stack gap={5}>
                        <h3>Delete project?</h3>
                        <p>This removes the project for everyone in the workspace.</p>
                        <ActionGroup align="end">
                          <Button variant="secondary">Cancel</Button>
                          <Button variant="destructive">Delete project</Button>
                        </ActionGroup>
                      </Stack>
                    </Card>
                  </Example>
                  <Example title="Interactive form">
                    <Dialog
                      open={dialogTheme === theme}
                      onOpenChange={(open) => setDialogTheme(open ? theme : null)}
                      trigger={<Button startIcon={<Add />}>Create project</Button>}
                      title="Create project"
                      description="Choose a name your team will recognize."
                      closeLabel="Cancel"
                      actions={
                        <Button
                          onClick={() => {
                            setDialogTheme(null);
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
                    <Text variant="caption" className="docs-caption" aria-live="polite">
                      {confirmation || 'Open a live dialog to explore focus, dismissal and theme.'}
                    </Text>
                  </Example>
                </>
              );
            default:
              return null;
          }
        }}
      </Paired>
      {id === 'toasts' && <ManagedToastExample key={resetVersion} />}
    </>
  );
}
