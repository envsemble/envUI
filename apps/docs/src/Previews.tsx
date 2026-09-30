import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import {
  Theme,
  Button,
  IconButton,
  NavigationItem,
  InfoChip,
  DisclosureNote,
  Card,
  ActionCard,
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
  Dialog,
  Toast,
  ToastProvider,
  useToast,
} from '@envsemble/ui';
import { Add, ChevronRight, Home, Search, Apps, Settings } from '@envsemble/ui/icons';

type Appearance = 'light' | 'dark';
export function Paired({ children }: { children: (theme: Appearance) => ReactNode }) {
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
      {(['light', 'dark'] as const).map((theme) => (
        <Theme
          key={theme}
          theme={theme}
          className="docs-preview"
          style={{ gridRow: `1 / span ${rows}`, gridColumn: theme === 'light' ? 1 : 2 }}
        >
          <p className="docs-theme-label">{theme === 'light' ? 'Light' : 'Dark'}</p>
          {children(theme)}
        </Theme>
      ))}
    </div>
  );
}
function Example({
  title,
  children,
  caption,
}: {
  title: string;
  children: ReactNode;
  caption?: string;
}) {
  return (
    <section className="docs-example">
      <h2>{title}</h2>
      {children}
      {caption && <p className="docs-caption">{caption}</p>}
    </section>
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
    <>
      <div className="docs-actions">
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
      </div>
      <p className="docs-caption">
        Show several notices to explore the queue. Hover or focus a notice to pause its timer.
      </p>
    </>
  );
}
function ManagedToastExample() {
  const [theme, setTheme] = useState<Appearance>('light');
  return (
    <section className="docs-managed-toast">
      <h2>Managed delivery</h2>
      <div className="docs-actions">
        <Button
          variant={theme === 'light' ? 'primary' : 'secondary'}
          onClick={() => setTheme('light')}
        >
          Light appearance
        </Button>
        <Button
          variant={theme === 'dark' ? 'primary' : 'secondary'}
          onClick={() => setTheme('dark')}
        >
          Dark appearance
        </Button>
      </div>
      <Theme theme={theme} className="docs-managed-pane">
        <ToastProvider key={theme} defaultPlacement="bottom-right">
          <ManagedControls />
        </ToastProvider>
      </Theme>
    </section>
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
            case 'buttons':
              return (
                <>
                  <Example title="Variants & states">
                    <ButtonMatrix />
                  </Example>
                  <Example title="Labels & icons">
                    <div className="docs-actions">
                      <Button onClick={() => setConfirmation('Item created')}>Create item</Button>
                      <Button startIcon={<Add />} onClick={() => setConfirmation('Item created')}>
                        Create item
                      </Button>
                      <Button endIcon={<ChevronRight />}>Continue</Button>
                    </div>
                  </Example>
                  <Example title="Grouped actions">
                    <div className="docs-actions">
                      <Button variant="secondary" onClick={() => setConfirmation('Cancelled')}>
                        Cancel
                      </Button>
                      <Button onClick={() => setConfirmation('Changes saved')}>Save changes</Button>
                    </div>
                    <div className="docs-stack docs-stacked-actions">
                      <Button onClick={() => setConfirmation('Changes saved')}>Save changes</Button>
                      <Button variant="secondary">Cancel</Button>
                    </div>
                    <p className="docs-caption" aria-live="polite">
                      {confirmation || 'One primary action per group'}
                    </p>
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
                    <div className="docs-actions">
                      <Button startIcon={<Add />}>Create item</Button>
                      <IconButton
                        icon={<ChevronRight />}
                        aria-label="Next item"
                        onClick={() => setConfirmation('Moved to next item')}
                      />
                      <IconButton icon={<Settings />} aria-label="Settings" />
                    </div>
                    <p className="docs-caption" aria-live="polite">
                      {confirmation}
                    </p>
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
                    <div className="docs-stack">
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
                    </div>
                  </Example>
                  <Example title="Validation & availability">
                    <div className="docs-stack">
                      <Input
                        label="Invalid field"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        error="Choose a unique project name."
                      />
                      <Input label="Read-only field" value="Workspace default" readOnly />
                      <Input label="Disabled field" value="Unavailable" disabled />
                    </div>
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
                    <div className="docs-stack">
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
                    </div>
                  </Example>
                </>
              );
            case 'checkbox':
              return (
                <>
                  <Example title="Independent selection">
                    <div className="docs-stack">
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
                    </div>
                  </Example>
                  <Example title="Partial selection">
                    <div className="docs-stack">
                      <Checkbox label="All projects" checked={mixed} onCheckedChange={setMixed} />
                      <Button variant="secondary" onClick={() => setMixed('mixed')}>
                        Restore partial selection
                      </Button>
                    </div>
                  </Example>
                </>
              );
            case 'switch':
              return (
                <Example title="On, off & disabled">
                  <div className="docs-stack">
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
                  </div>
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
                    <div className="docs-stack">
                      {['Home', 'Projects', 'Settings'].map((label, i) => (
                        <NavigationItem
                          key={label}
                          selected={selected === label}
                          onClick={() => setSelected(label)}
                          icon={i === 0 ? <Home /> : i === 1 ? <Apps /> : <Settings />}
                          selectedIcon={
                            i === 0 ? (
                              <Home filled />
                            ) : i === 1 ? (
                              <Apps filled />
                            ) : (
                              <Settings filled />
                            )
                          }
                        >
                          {label}
                        </NavigationItem>
                      ))}
                    </div>
                  </Example>
                  <Example title="States">
                    <div className="docs-stack">
                      <NavigationItem icon={<Home />}>Home</NavigationItem>
                      <NavigationItem icon={<Home />} selectedIcon={<Home filled />} selected>
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
                    <div className="docs-gap">
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
                    </div>
                    <p className="docs-caption" aria-live="polite">
                      {confirmation}
                    </p>
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
                  <Example title="General surface">
                    <Card>
                      <h3>Project overview</h3>
                      <p>Related information lives together in a rounded surface.</p>
                      <InfoChip>Updated today</InfoChip>
                    </Card>
                  </Example>
                  <Example title="Action strip">
                    <ActionCard
                      title="Autumn release"
                      meta="Updated today"
                      actions={
                        <>
                          <Button variant="secondary">Share</Button>
                          <Button variant="outlined">Open project</Button>
                        </>
                      }
                    >
                      Shared context for the next release.
                    </ActionCard>
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
                    <div className="docs-actions">
                      <InfoChip>Optional</InfoChip>
                      <InfoChip>Read only</InfoChip>
                      <InfoChip>3 members</InfoChip>
                    </div>
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
                    <Card>
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
                    </Card>
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
                    <p className="docs-caption" aria-live="polite">
                      {confirmation}
                    </p>
                  </Example>
                </>
              );
            case 'loading':
              return (
                <>
                  <Example title="Content placeholders">
                    <Card>
                      <LoadingState label="Loading project">
                        <div className="docs-stack docs-skeletons">
                          <Skeleton width="38%" height="1.25rem" />
                          <Skeleton width="100%" height="0.8rem" />
                          <Skeleton width="72%" height="0.8rem" />
                        </div>
                      </LoadingState>
                    </Card>
                  </Example>
                  <Example title="Row placeholders">
                    <LoadingState label="Loading settings">
                      <div className="docs-stack">
                        {[1, 2, 3].map((i) => (
                          <Skeleton key={i} width="100%" height="3.5rem" />
                        ))}
                      </div>
                    </LoadingState>
                  </Example>
                </>
              );
            case 'toasts':
              return (
                <>
                  <Example title="Manual notices">
                    <div className="docs-stack">
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
                      <p className="docs-caption" aria-live="polite">
                        {confirmation}
                      </p>
                    </div>
                  </Example>
                </>
              );
            case 'dialogs':
              return (
                <>
                  <Example title="Confirmation composition">
                    <Card>
                      <div className="docs-dialog-anatomy">
                        <h3>Delete project?</h3>
                        <p>This removes the project for everyone in the workspace.</p>
                        <div className="docs-actions docs-align-end">
                          <Button variant="secondary">Cancel</Button>
                          <Button variant="destructive">Delete project</Button>
                        </div>
                      </div>
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
                    <p className="docs-caption" aria-live="polite">
                      {confirmation || 'Open a live dialog to explore focus, dismissal and theme.'}
                    </p>
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

export function OverviewPreview() {
  const [notifications, setNotifications] = useState(true);
  const [visibility, setVisibility] = useState('team');
  const [note, setNote] = useState(false);
  return (
    <Paired>
      {(theme) => (
        <>
          <Example title="A connected workspace">
            <FeatureCard
              icon={<Apps />}
              title="Bring your next release together"
              description="Projects, people and shared decisions in one workspace."
              action={
                <Button
                  startIcon={<Add />}
                  onClick={() => {
                    location.hash = '/components/buttons/preview';
                  }}
                >
                  Create project
                </Button>
              }
            />
          </Example>
          <Example title="Project settings">
            <GroupedRows>
              <Row title="Project" detail="Autumn release" action={<InfoChip>Active</InfoChip>} />
              <Row
                title="Notifications"
                detail="Keep everyone up to date"
                action={
                  <Switch
                    label="Enable notifications"
                    checked={notifications}
                    onCheckedChange={setNotifications}
                  />
                }
              />
            </GroupedRows>
            <div className="docs-gap">
              <Select
                label="Visibility"
                name={`overview-visibility-${theme}`}
                value={visibility}
                onValueChange={(v) => setVisibility(v ?? 'team')}
                options={[
                  { value: 'team', label: 'Team' },
                  { value: 'private', label: 'Private' },
                ]}
              />
            </div>
            <DisclosureNote
              title="How visibility works"
              open={note}
              onToggle={(e) => setNote(e.currentTarget.open)}
            >
              <p>Choose who can see the project. The application owns your selection.</p>
            </DisclosureNote>
          </Example>
          <Example title="Related actions">
            <ActionCard
              title="Autumn release"
              meta="Updated today"
              actions={
                <>
                  <Button variant="secondary">Share</Button>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      location.hash = '/components/cards/preview';
                    }}
                  >
                    View project
                  </Button>
                </>
              }
            >
              A composed example using the public library components.
            </ActionCard>
          </Example>
        </>
      )}
    </Paired>
  );
}
