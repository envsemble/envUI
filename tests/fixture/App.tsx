import { useEffect, useRef, useState } from 'react';
import {
  Button,
  Checkbox,
  Dialog,
  FeatureCard,
  Card,
  ClickableCard,
  ActionCard,
  Stack,
  ActionGroup,
  InfoChip,
  DisclosureNote,
  IconButton,
  Input,
  Icon,
  NavigationItem,
  Radio,
  RadioGroup,
  Select,
  Switch,
  Textarea,
  Theme,
  Toast,
  ToastProvider,
  useToast,
} from '@envsemble/envui';
import type { ButtonVariant, CheckboxState, SelectOption, ThemeValue } from '@envsemble/envui';
import { ChevronRight } from '@envsemble/envui/icons/ChevronRight';
import { Home } from '@envsemble/envui/icons/Home';
import { Settings } from '@envsemble/envui/icons/Settings';
import '@envsemble/envui/styles.css';
import './Fixture.css';
import { ButtonGroupsFixture } from './ButtonGroups';

const plans: readonly SelectOption[] = [
  { value: 'starter', label: 'Starter' },
  { value: 'team', label: 'Team' },
  { value: 'enterprise', label: 'Enterprise', disabled: true },
];
const dialogChoices: readonly SelectOption[] = [
  { value: 'atlas', label: 'Atlas' },
  { value: 'boreal', label: 'Boreal' },
];

function FormsFixture() {
  const [controlled, setControlled] = useState<CheckboxState>('mixed');
  const [frozenRequest, setFrozenRequest] = useState('none');
  const [values, setValues] = useState<Record<string, string>>({});
  const [requiredSubmissions, setRequiredSubmissions] = useState(0);
  const [preventReset, setPreventReset] = useState(false);
  return (
    <section className="fixture-section">
      <h1>Native forms</h1>
      <form
        data-testid="main-form"
        onReset={(event) => {
          if (preventReset) event.preventDefault();
        }}
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          setValues(Object.fromEntries([...data].map(([name, value]) => [name, String(value)])));
        }}
      >
        <Input
          label="Project name"
          hint="A descriptive name"
          name="project"
          defaultValue="Initial project"
          required
        />
        <Textarea
          label="Notes"
          hint="Optional supporting details"
          name="notes"
          defaultValue="Initial notes"
        />
        <Input
          label="Invalid sample"
          error="Please correct this value"
          defaultValue="Invalid value"
        />
        <Checkbox
          data-testid="controlled-checkbox"
          label="Controlled mixed"
          name="controlled"
          value="enabled"
          checked={controlled}
          onCheckedChange={setControlled}
        />
        <Checkbox
          data-testid="uncontrolled-checkbox"
          label="Uncontrolled mixed"
          name="uncontrolled"
          value="enabled"
          defaultChecked="mixed"
        />
        <Checkbox
          data-testid="frozen-checkbox"
          label="Fixed mixed"
          checked="mixed"
          onCheckedChange={(next) => setFrozenRequest(String(next))}
        />
        <Switch label="Notifications" name="notifications" value="enabled" defaultChecked />
        <RadioGroup
          label="Visibility"
          name="visibility"
          defaultValue="private"
          required
          variant="rows"
        >
          <Radio value="private" label="Private" detail="Only invited members" />
          <Radio value="shared" label="Shared" detail="Anyone with access" />
        </RadioGroup>
        <Select label="Plan" name="plan" options={plans} defaultValue="starter" required />
        <Select
          label="Empty choice"
          name="emptyChoice"
          options={dialogChoices}
          placeholder="Choose an option"
        />
        <Checkbox
          label="Prevent form reset"
          checked={preventReset}
          onCheckedChange={setPreventReset}
        />
        <div className="fixture-actions">
          <Button type="submit">Submit form</Button>
          <Button type="reset" variant="secondary">
            Reset form
          </Button>
          <Button variant="outlined" onClick={() => setControlled('mixed')}>
            Restore controlled mixed
          </Button>
        </div>
      </form>
      <output data-testid="control-state">{String(controlled)}</output>
      <output data-testid="frozen-request">{frozenRequest}</output>
      <output data-testid="form-values">{JSON.stringify(values)}</output>
      <form
        data-testid="required-form"
        onSubmit={(event) => {
          event.preventDefault();
          setRequiredSubmissions((count) => count + 1);
        }}
      >
        <Select
          label="Required choice"
          name="requiredChoice"
          options={dialogChoices}
          placeholder="Choose a required option"
          required
        />
        <Button type="submit">Submit required choice</Button>
      </form>
      <output data-testid="required-submissions">{requiredSubmissions}</output>
    </section>
  );
}

function DialogFixture() {
  const [open, setOpen] = useState(false);
  const firstField = useRef<HTMLInputElement>(null);
  return (
    <Theme theme="dark" data-testid="nested-dark" className="fixture-section">
      <h2>Nested dark theme</h2>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Dark theme dialog"
        description="A nested theme retained in a portal."
        closeLabel="Cancel"
        initialFocus={firstField}
        trigger={<Button>Open dark dialog</Button>}
        actions={<Button onClick={() => setOpen(false)}>Save dialog</Button>}
      >
        <Input ref={firstField} label="Dialog first field" defaultValue="Dialog value" />
        <Select label="Dialog choice" options={dialogChoices} defaultValue="atlas" />
      </Dialog>
      <output data-testid="dialog-status">{open ? 'open' : 'closed'}</output>
    </Theme>
  );
}

function ToastTriggers() {
  const toast = useToast();
  const [actionCount, setActionCount] = useState(0);
  return (
    <section className="fixture-section">
      <h2>Managed notifications</h2>
      <div className="fixture-actions">
        <Button
          data-testid="toast-neutral"
          onClick={() => toast.show({ message: 'Neutral notice' })}
        >
          Show neutral notice
        </Button>
        <Button
          data-testid="toast-short"
          onClick={() => toast.show({ message: 'Short notice', duration: 500 })}
        >
          Show short notice
        </Button>
        <Button
          data-testid="toast-success"
          onClick={() => toast.show({ message: 'Success notice', variant: 'success' })}
        >
          Show success notice
        </Button>
        <Button
          data-testid="toast-info"
          onClick={() => toast.show({ message: 'Info notice', variant: 'info' })}
        >
          Show info notice
        </Button>
        <Button
          data-testid="toast-error"
          onClick={() =>
            toast.show({ message: 'Persistent error notice', variant: 'error' })
          }
        >
          Show error notice
        </Button>
        <Button
          data-testid="toast-action"
          onClick={() =>
            toast.show({
              message: 'Persistent action notice',
              variant: 'info',
              action: { label: 'Undo notice', onClick: () => setActionCount((count) => count + 1) },
            })
          }
        >
          Show action notice
        </Button>
        <Button
          data-testid="toast-top"
          onClick={() =>
            toast.show({ message: 'Top center notice', placement: 'top-center', duration: 0 })
          }
        >
          Show top center notice
        </Button>
        <Button
          data-testid="toast-queue-bottom"
          onClick={() => {
            for (let index = 1; index <= 4; index++)
              toast.show({
                message: `Bottom queue ${index}`,
                placement: 'bottom-right',
                duration: 0,
              });
          }}
        >
          Queue bottom notices
        </Button>
        <Button
          data-testid="toast-queue-top"
          onClick={() => {
            for (let index = 1; index <= 4; index++)
              toast.show({ message: `Top queue ${index}`, placement: 'top-center', duration: 0 });
          }}
        >
          Queue top notices
        </Button>
        <Button data-testid="toast-clear" variant="secondary" onClick={toast.clear}>
          Clear managed notices
        </Button>
      </div>
      <output data-testid="toast-action-count">{actionCount}</output>
    </section>
  );
}

function ManualToastFixture() {
  const [visible, setVisible] = useState(true);
  const [actions, setActions] = useState(0);
  return (
    <section className="fixture-section" data-testid="manual-toast-section">
      <h2>Independent manual notification</h2>
      {visible && (
        <Toast
          data-testid="manual-toast"
          message="Manual independent notice"
          dismissLabel="Dismiss manual notice"
          onDismiss={() => setVisible(false)}
          action={{ label: 'Manual action', onClick: () => setActions((count) => count + 1) }}
        />
      )}
      <output data-testid="manual-action-count">{actions}</output>
      <Button variant="secondary" onClick={() => setVisible(true)}>
        Restore manual notice
      </Button>
    </section>
  );
}

function ColorControls({ theme }: { theme: ThemeValue }) {
  const variants: readonly ButtonVariant[] = [
    'primary',
    'secondary',
    'outlined',
    'destructive',
    'important',
  ];
  return (
    <Theme theme={theme} data-testid={`color-controls-${theme}`} className="fixture-section">
      <h2>{theme} interactive colors</h2>
      {variants.map((variant) => (
        <Button key={variant} variant={variant} data-testid={`${theme}-button-${variant}`}>
          {theme} {variant}
        </Button>
      ))}
      <IconButton
        icon={<ChevronRight />}
        aria-label={`${theme} chevron`}
        data-testid={`${theme}-icon-button`}
      />
      <NavigationItem data-testid={`${theme}-navigation`}>{theme} navigation</NavigationItem>
      <NavigationItem selected data-testid={`${theme}-navigation-selected`}>
        {theme} selected navigation
      </NavigationItem>
    </Theme>
  );
}

function NavigationFixture({ theme }: { theme: ThemeValue }) {
  const [selected, setSelected] = useState('home');
  return (
    <Theme theme={theme} data-testid={`navigation-icons-${theme}`} className="fixture-section">
      <ActionGroup>
        <Home data-testid="home-outline" />
        <Home filled data-testid="home-filled" />
        <Settings data-testid="settings-outline" />
        <Settings filled data-testid="settings-filled" />
      </ActionGroup>
      <Stack>
        <NavigationItem
          data-testid="home-navigation"
          icon={<Home filled={false} />}
          selected={selected === 'home'}
          onClick={() => setSelected('home')}
        >
          Home destination
        </NavigationItem>
        <NavigationItem
          data-testid="settings-navigation"
          icon={
            <span>
              <Settings filled />
            </span>
          }
          selected={selected === 'settings'}
          onClick={() => setSelected('settings')}
        >
          Settings destination
        </NavigationItem>
        <NavigationItem
          data-testid="custom-navigation"
          icon={
            <Icon viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="8" />
            </Icon>
          }
          selectedIcon={
            <Icon viewBox="0 0 24 24">
              <rect x="4" y="4" width="16" height="16" />
            </Icon>
          }
          selected={selected === 'custom'}
          onClick={() => setSelected('custom')}
        >
          Custom destination
        </NavigationItem>
      </Stack>
    </Theme>
  );
}

export default function App() {
  const [stress, setStress] = useState(false);
  const [cardActivations, setCardActivations] = useState(0);
  return (
    <>
      <p data-testid="host-marker">Host document marker</p>
      <Theme theme="light">
        <main className="fixture-main">
          <FormsFixture />
          <DialogFixture />
          <ToastProvider>
            <ToastTriggers />
          </ToastProvider>
          <ManualToastFixture />
          <ColorControls theme="light" />
          <ColorControls theme="dark" />
          <NavigationFixture theme="light" />
          <NavigationFixture theme="dark" />
          <ButtonGroupsFixture theme="light" />
          <ButtonGroupsFixture theme="dark" />
          {(['light', 'dark'] as const).map((theme) => (
            <Theme
              key={theme}
              theme={theme}
              className="fixture-section"
              data-testid={`layout-${theme}`}
            >
              <Card data-testid="layout-card" style={{ maxInlineSize: '24rem' }}>
                <h3>Related content</h3>
                <p>A description with enough content to wrap on a narrow screen.</p>
                <ActionGroup>
                  <Button variant="secondary">Cancel</Button>
                  <Button>Save changes</Button>
                </ActionGroup>
                <InfoChip>Updated today</InfoChip>
                <DisclosureNote title={`Card guidance ${theme}`} open>
                  <p>First detail</p>
                  <p>Second detail</p>
                </DisclosureNote>
              </Card>
              <Stack data-testid="layout-stack" gap={3} style={{ maxInlineSize: '20rem' }}>
                <Input label={`Layout field ${theme}`} />
                <Button>Fit action</Button>
                <NavigationItem selected>Destination</NavigationItem>
                <InfoChip>Metadata</InfoChip>
                <DisclosureNote title={`Stack guidance ${theme}`} open>
                  <p>Supporting detail</p>
                </DisclosureNote>
              </Stack>
              <ActionGroup stacked data-testid="stacked-actions" style={{ maxInlineSize: '20rem' }}>
                <Button>Continue</Button>
                <Button variant="secondary">Cancel</Button>
                <IconButton icon={<ChevronRight />} aria-label={`Stacked next ${theme}`} />
              </ActionGroup>
              <ActionCard
                title="Shared action card"
                data-testid="flush-action-card"
                actions={<Button>Continue</Button>}
              >
                <p>Keep the action rail attached.</p>
              </ActionCard>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  throw new Error('Card submitted a form');
                }}
              >
                <ClickableCard
                  data-testid="clickable-action"
                  onClick={() => setCardActivations((value) => value + 1)}
                >
                  <span>Activate card</span>
                  <span data-testid="card-activations">{cardActivations}</span>
                </ClickableCard>
              </form>
              <ClickableCard href="#destination" data-testid="clickable-link">
                Open destination
              </ClickableCard>
              <ClickableCard
                disabled
                data-testid="disabled-card"
                onClick={() => setCardActivations((value) => value + 1)}
              >
                Unavailable action
              </ClickableCard>
              <ClickableCard
                href="#blocked"
                disabled
                data-testid="disabled-card-link"
                onClick={() => setCardActivations((value) => value + 1)}
              >
                Unavailable destination
              </ClickableCard>
              <FeatureCard
                title="Additional content"
                description="Supporting context"
                data-testid="feature-extra"
              >
                <p>Extra detail</p>
                <p>Another detail</p>
                <Button>Explore detail</Button>
                <DisclosureNote title={`Feature guidance ${theme}`} open>
                  <p>Available options</p>
                  <ul>
                    <li>First option</li>
                    <li>Second option</li>
                  </ul>
                  <p>Choose an option</p>
                </DisclosureNote>
              </FeatureCard>
            </Theme>
          ))}
          <section className="fixture-section">
            <h2>Standalone responsive cards</h2>
            {[true, false].map((withIcon) => (
              <FeatureCard
                key={String(withIcon)}
                data-testid={`standalone-feature-${withIcon ? 'icon' : 'plain'}`}
                icon={withIcon ? <ChevronRight /> : undefined}
                title="Connected workspace"
                description="Supporting details"
                action={<Button>Open workspace</Button>}
                style={{ width: '100%' }}
              />
            ))}
          </section>
          <Button onClick={() => setStress(true)}>Mount strict toast provider</Button>
          {stress && (
            <ToastProvider>
              <MountNotice />
            </ToastProvider>
          )}
        </main>
      </Theme>
    </>
  );
}

function MountNotice() {
  const toast = useToast();
  useEffect(() => {
    toast.show({ message: 'Mounted persistent notice', variant: 'error' });
  }, [toast]);
  return (
    <Button
      onClick={() => {
        for (let i = 0; i < 3; i++)
          toast.show({ message: `Extra persistent ${i}`, variant: 'error' });
      }}
    >
      Add strict notices
    </Button>
  );
}
