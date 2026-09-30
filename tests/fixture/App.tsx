import { useEffect, useRef, useState } from 'react';
import {
  Button,
  Checkbox,
  Dialog,
  FeatureCard,
  IconButton,
  Input,
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
} from '@envsemble/ui';
import type { ButtonVariant, CheckboxState, SelectOption, ThemeValue } from '@envsemble/ui';
import { ChevronRight } from '@envsemble/ui/icons/ChevronRight';
import '@envsemble/ui/styles.css';
import './Fixture.css';

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
            toast.show({ message: 'Persistent error notice', variant: 'error', duration: 50 })
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
              duration: 50,
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

export default function App() {
  const [stress, setStress] = useState(false);
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
