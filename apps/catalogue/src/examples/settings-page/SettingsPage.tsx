import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react';
import {
  Alert,
  Avatar,
  Badge,
  Button,
  ConfirmDialog,
  Link,
  List,
  NavList,
  Page,
  PageHeader,
  Panes,
  Radio,
  RadioGroup,
  Column,
  Row,
  Surface,
  Switch,
  Text,
  TextField,
  useThemePreference,
  useToast,
  type ThemePreference,
} from '@envsemble/envui';

type SectionId = 'profile' | 'notifications' | 'appearance' | 'danger-zone';

/**
 * A settings page inside the app frame: the sections in one column, with an "On this page"
 * navigation in a supporting pane beside them from an expanded width. Profile waits for Save; notifications and appearance
 * apply as they change; the danger zone confirms by name.
 */
export default function SettingsPage() {
  const id = useId();
  const [chosen, setChosen] = useState<SectionId>('profile');
  const headings = useRef(new Map<SectionId, HTMLElement>());
  const heading = (section: SectionId) => (element: HTMLElement | null) => {
    if (element) headings.current.set(section, element);
  };
  // While a chosen section scrolls into view, scrolling doesn't change the selection.
  const chosenAt = useRef(0);
  const go = (section: SectionId) => {
    setChosen(section);
    chosenAt.current = performance.now();
    // The section's heading takes focus, so reading and the keyboard continue from there.
    headings.current.get(section)?.focus();
  };
  // The selection follows scrolling: the current section is the one whose top most recently
  // passed above the line 40% down the window, the first before any has, and the last only once
  // the page has scrolled to the bottom, since a short last section can't reach that line.
  useEffect(() => {
    const elements = sections.map((section) => document.getElementById(`${id}-${section.id}`));
    // What scrolls the sections: the nearest ancestor that scrolls, else the document.
    const scroller = () => {
      for (let node = elements[0]?.parentElement; node; node = node.parentElement) {
        const { overflowY } = getComputedStyle(node);
        if (/auto|scroll/.test(overflowY) && node.scrollHeight > node.clientHeight) return node;
      }
      return document.scrollingElement ?? document.documentElement;
    };
    let frame = 0;
    const update = () => {
      frame = 0;
      if (performance.now() - chosenAt.current < 500) return;
      const line = window.innerHeight * 0.4;
      const { scrollTop, clientHeight, scrollHeight } = scroller();
      const atBottom = scrollTop > 0 && scrollTop + clientHeight >= scrollHeight - 1;
      let current = 0;
      elements.forEach((element, index) => {
        if (element && element.getBoundingClientRect().top <= line) current = index;
      });
      if (atBottom) current = sections.length - 1;
      setChosen(sections[current].id);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    schedule();
    // Scroll events don't bubble: listening as they pass the document catches any scroller's.
    document.addEventListener('scroll', schedule, { capture: true, passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('scroll', schedule, { capture: true });
      window.removeEventListener('resize', schedule);
    };
  }, [id]);

  return (
    <Page
      width="lg"
      header={
        <PageHeader title="Settings" description="Your profile and how Northwind works for you." />
      }
    >
      {/* The sections in the main pane, and "On this page" in a supporting pane beside them from
          an expanded width; narrower, the sections follow each other alone. */}
      <Panes.Root behavior="supporting">
        <Panes.Main>
          <Column gap={8}>
            <Section id={`${id}-profile`} title="Profile" headingRef={heading('profile')}>
              <ProfileForm />
            </Section>
            <Section
              id={`${id}-notifications`}
              title="Notifications"
              description="Changes apply at once."
              headingRef={heading('notifications')}
            >
              <Notifications />
            </Section>
            <Section
              id={`${id}-appearance`}
              title="Appearance"
              description="Applies to Northwind on this device."
              headingRef={heading('appearance')}
            >
              <Appearance />
            </Section>
            <Section
              id={`${id}-danger-zone`}
              title="Danger zone"
              headingRef={heading('danger-zone')}
            >
              <DangerZone />
            </Section>
          </Column>
        </Panes.Main>
        <Panes.Supporting
          label="On this page"
          // The pane scrolls with the page rather than on its own, so its navigation sticks.
          style={{ overflow: 'visible', paddingInlineStart: 'var(--env-space-8)' }}
        >
          <nav
            aria-label="Settings sections"
            style={{ position: 'sticky', insetBlockStart: 'var(--env-space-6)' }}
          >
            <NavList.Root>
              {sections.map((section) => (
                <NavList.Item
                  key={section.id}
                  href={`#${id}-${section.id}`}
                  selected={chosen === section.id}
                  // Links within the page: the current one is a location, not a page.
                  aria-current={chosen === section.id ? 'location' : undefined}
                  onClick={(event) => {
                    event.preventDefault();
                    go(section.id);
                  }}
                >
                  {section.title}
                </NavList.Item>
              ))}
            </NavList.Root>
          </nav>
        </Panes.Supporting>
      </Panes.Root>
    </Page>
  );
}

/** A section named by its heading, which the navigation focuses. */
function Section({
  id,
  title,
  description,
  headingRef,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  headingRef: (element: HTMLElement | null) => void;
  children: ReactNode;
}) {
  return (
    <Column render={<section id={id} aria-labelledby={`${id}-heading`} />} gap={4}>
      <Column gap={1}>
        <Text ref={headingRef} id={`${id}-heading`} tabIndex={-1} variant="title" render={<h2 />}>
          {title}
        </Text>
        {description && <Text emphasis="muted">{description}</Text>}
      </Column>
      {children}
    </Column>
  );
}

type ProfileField = 'name' | 'email';

const profileRules: Record<ProfileField, (value: string) => string | undefined> = {
  name: (value) => (value.trim() ? undefined : 'Enter your name'),
  email: (value) =>
    !value.trim()
      ? 'Enter your email address'
      : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
        ? undefined
        : 'Enter an email address like name@example.com',
};

/** Fields that depend on each other wait for Save, and keep their edits until Save or Cancel. */
function ProfileForm() {
  const id = useId();
  const toast = useToast();
  const [saved, setSaved] = useState(initialProfile);
  const [draft, setDraft] = useState(initialProfile);
  const [errors, setErrors] = useState<Partial<Record<ProfileField, string>>>({});
  const [summaryShown, setSummaryShown] = useState(0);
  const [saving, setSaving] = useState(false);
  // An error after Enter in the field it names: focus is already there, so the status says it.
  const [status, setStatus] = useState('');
  const refs = { name: useRef<HTMLInputElement>(null), email: useRef<HTMLInputElement>(null) };
  const summary = useRef<HTMLDivElement>(null);
  const timer = useRef<number>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  useEffect(() => {
    if (summaryShown) summary.current?.focus();
  }, [summaryShown]);
  const changed = draft.name !== saved.name || draft.email !== saved.email;
  const listed = (['name', 'email'] as const).filter((field) => errors[field]);

  const edit = (field: ProfileField, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
    // An error goes away as soon as the value is right; none appears while people type.
    if (errors[field] && !profileRules[field](value))
      setErrors((current) => ({ ...current, [field]: undefined }));
    setStatus('');
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;
    const found = { name: profileRules.name(draft.name), email: profileRules.email(draft.email) };
    setErrors(found);
    const wrong = (['name', 'email'] as const).filter((field) => found[field]);
    if (wrong.length > 1) {
      setStatus('');
      setSummaryShown((count) => count + 1);
      return;
    }
    if (wrong.length === 1) {
      const field = refs[wrong[0]].current;
      if (document.activeElement === field) setStatus(found[wrong[0]]!);
      else field?.focus();
      return;
    }
    setSaving(true);
    // The profile is saved on a server; a timer stands in for it.
    timer.current = window.setTimeout(() => {
      setSaving(false);
      setSaved(draft);
      toast.show({ message: 'Profile saved.' });
    }, 1000);
  };

  const cancel = () => {
    setDraft(saved);
    setErrors({});
    setStatus('');
  };

  return (
    <Surface background="muted" render={<form noValidate aria-label="Profile" onSubmit={submit} />}>
      {/* envUI has no form column yet: one column, kept to a width that reads easily. */}
      <Column gap={5} style={{ maxInlineSize: '32rem' }}>
        {listed.length > 1 && (
          // envUI has no error summary yet: a danger Alert lists each error as a link to its field.
          <Alert
            ref={summary}
            tabIndex={-1}
            tone="danger"
            title={
              <span role="heading" aria-level={3}>
                There is a problem
              </span>
            }
          >
            <Column render={<ul />} gap={1}>
              {listed.map((field) => (
                <li key={field}>
                  <Link
                    href={`#${id}-${field}`}
                    onClick={(event) => {
                      event.preventDefault();
                      refs[field].current?.focus();
                    }}
                  >
                    {errors[field]}
                  </Link>
                </li>
              ))}
            </Column>
          </Alert>
        )}
        <Row align="center" gap={3}>
          <Avatar name={saved.name} size="lg" fallback="initials" />
          {changed && <Badge tone="warning">Unsaved changes</Badge>}
        </Row>
        <TextField
          ref={refs.name}
          id={`${id}-name`}
          label="Name"
          name="name"
          autoComplete="name"
          value={draft.name}
          error={errors.name}
          onValueChange={(value) => edit('name', value)}
        />
        <TextField
          ref={refs.email}
          id={`${id}-email`}
          label="Email address"
          name="email"
          type="email"
          autoComplete="email"
          spellCheck={false}
          description="Where Northwind sends your notifications."
          value={draft.email}
          error={errors.email}
          onValueChange={(value) => edit('email', value)}
        />
        <Row wrap align="center" gap={3}>
          {/* Never disabled: Save says what is wrong, and pending ignores presses while saving. */}
          <Button type="submit" pending={saving}>
            Save profile
          </Button>
          <Button variant="secondary" onClick={cancel}>
            Cancel
          </Button>
          {/* Beside the buttons, so while it is empty it adds no line below them. */}
          <Text role="status" emphasis="muted">
            {status}
          </Text>
        </Row>
      </Column>
    </Surface>
  );
}

/** Switches that apply as they change: no Save button, and a toast only for an effect elsewhere. */
function Notifications() {
  const id = useId();
  const toast = useToast();
  const [values, setValues] = useState<Record<string, boolean>>({
    comments: true,
    mentions: true,
    summary: false,
  });
  const change = (setting: string, on: boolean) => {
    // The change is stored as it is made; a request to the server would go here.
    setValues((current) => ({ ...current, [setting]: on }));
    if (setting === 'summary')
      toast.show({
        message: on ? 'Weekly summary turned on.' : 'Weekly summary turned off.',
      });
  };
  return (
    <List.Root aria-label="Email notifications">
      {notificationSettings.map((setting) => (
        <List.Item
          key={setting.id}
          // envUI has no List row that keeps its action beside the text yet: the row doesn't wrap,
          // so the switch stays beside its text at every width, and the text wraps.
          style={{ flexWrap: 'nowrap' }}
          label={<span id={`${id}-${setting.id}-title`}>{setting.title}</span>}
          description={<span id={`${id}-${setting.id}-detail`}>{setting.detail}</span>}
          action={
            // The row's title names the switch, and its detail describes it.
            <Switch
              aria-labelledby={`${id}-${setting.id}-title`}
              aria-describedby={`${id}-${setting.id}-detail`}
              checked={values[setting.id]}
              onCheckedChange={(on) => change(setting.id, on)}
              // envUI has no List row that keeps its action beside the text yet: nor does the
              // switch shrink.
              style={{ flexShrink: 0 }}
            />
          }
        />
      ))}
    </List.Root>
  );
}

/** The theme and the density, which apply at once. */
function Appearance() {
  // The application's ThemePreferenceProvider stores the theme and applies it to every page.
  const { preference, setPreference } = useThemePreference();
  // One scale for the whole application: store it and pass it to the root provider's `scale`.
  // This sample only keeps the choice.
  const [scale, setScale] = useState<'comfortable' | 'compact'>('comfortable');
  return (
    <Column gap={6}>
      <RadioGroup
        label="Theme"
        name="theme"
        orientation="vertical"
        value={preference}
        onValueChange={(value) => {
          const next = themes.find((theme) => theme === value);
          if (next) setPreference(next);
        }}
      >
        <Radio value="system" label="System" description="Follows your device’s setting." />
        <Radio value="light" label="Light" />
        <Radio value="dark" label="Dark" />
      </RadioGroup>
      <RadioGroup
        label="Density"
        name="scale"
        orientation="vertical"
        value={scale}
        onValueChange={(value) => setScale(value === 'compact' ? 'compact' : 'comfortable')}
      >
        <Radio
          value="comfortable"
          label="Comfortable"
          description="Roomier controls and text, for most screens."
        />
        <Radio
          value="compact"
          label="Compact"
          description="Smaller controls and text, to see more at once."
        />
      </RadioGroup>
    </Column>
  );
}

/** Deleting the workspace can't be undone and reaches everyone, so it asks for the name. */
function DangerZone() {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState('');
  const [error, setError] = useState<string>();
  const [deleted, setDeleted] = useState(false);
  const field = useRef<HTMLInputElement>(null);
  const matches = typed.trim() === workspaceName;
  return (
    <Column gap={3}>
      <List.Root aria-label="Danger zone">
        <List.Item
          label="Delete this workspace"
          description="Deletes every project, document and member of Northwind."
          action={
            <Button
              variant="outline"
              tone="danger"
              onClick={() => {
                setTyped('');
                setError(undefined);
                setOpen(true);
              }}
            >
              Delete workspace…
            </Button>
          }
        />
      </List.Root>
      <Text role="status" emphasis="muted">
        {deleted ? `${workspaceName} workspace deleted.` : ''}
      </Text>
      <ConfirmDialog
        open={open}
        onOpenChange={(next, details) => {
          // A confirmation with the wrong name keeps the dialog open, with the field's error.
          if (!next && details.reason === 'imperative-action' && !matches) return;
          setOpen(next);
        }}
        tone="danger"
        title={`Delete the ${workspaceName} workspace?`}
        description="This deletes every project, document and member, for everyone. You can’t undo this."
        confirmLabel="Delete workspace"
        onConfirm={() => {
          if (!matches) {
            setError(`Enter ${workspaceName} to confirm`);
            field.current?.focus();
            return;
          }
          // The workspace is deleted on a server, and the application then leaves it.
          setDeleted(true);
        }}
      >
        {/* Enter in the field confirms through onConfirm, as the confirm button does. */}
        <TextField
          ref={field}
          label="Workspace name"
          description={`Enter ${workspaceName} to confirm.`}
          autoComplete="off"
          spellCheck={false}
          value={typed}
          error={error}
          onValueChange={(value) => {
            setTyped(value);
            if (value.trim() === workspaceName) setError(undefined);
          }}
        />
      </ConfirmDialog>
    </Column>
  );
}

const sections: readonly { id: SectionId; title: string }[] = [
  { id: 'profile', title: 'Profile' },
  { id: 'notifications', title: 'Notifications' },
  { id: 'appearance', title: 'Appearance' },
  { id: 'danger-zone', title: 'Danger zone' },
];

const initialProfile = { name: 'Alex Morgan', email: 'alex.morgan@example.com' };

const notificationSettings = [
  { id: 'comments', title: 'Comments', detail: 'When someone comments on your documents.' },
  {
    id: 'mentions',
    title: 'Mentions',
    detail: 'When someone mentions you in a task or a comment.',
  },
  { id: 'summary', title: 'Weekly summary', detail: 'Your projects’ progress, every Monday.' },
];

const themes: readonly ThemePreference[] = ['system', 'light', 'dark'];

const workspaceName = 'Northwind';
