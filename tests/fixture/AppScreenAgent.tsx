import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  Badge,
  Button,
  Column,
  CommandPalette,
  Composer,
  CopyButton,
  Dialog,
  DiffStat,
  IconButton,
  Kbd,
  List,
  Message,
  MessageList,
  Page,
  PageHeader,
  Panes,
  Progress,
  Radio,
  RadioGroup,
  RelativeTime,
  Row,
  Select,
  Slider,
  Spinner,
  Surface,
  Switch,
  Text,
  Textarea,
  Tooltip,
  useToast,
  type CommandPaletteItem,
  type Destination,
} from '@envsemble/envui';
import { CodeBlock } from '@envsemble/envui/code';
import { CodeDiff, countDiffLines } from '@envsemble/envui/diff';
import { IconAttachFile } from '@envsemble/envui/icons/AttachFile';
import { IconBolt } from '@envsemble/envui/icons/Bolt';
import { IconCheckCircle } from '@envsemble/envui/icons/CheckCircle';
import { IconCommit } from '@envsemble/envui/icons/Commit';
import { IconDashboard } from '@envsemble/envui/icons/Dashboard';
import { IconError } from '@envsemble/envui/icons/Error';
import { IconFolder } from '@envsemble/envui/icons/Folder';
import { IconMonitoring } from '@envsemble/envui/icons/Monitoring';
import { IconPending } from '@envsemble/envui/icons/Pending';
import { IconReplay } from '@envsemble/envui/icons/Replay';
import { IconRocketLaunch } from '@envsemble/envui/icons/RocketLaunch';
import { IconSettings } from '@envsemble/envui/icons/Settings';
import { IconSmartToy } from '@envsemble/envui/icons/SmartToy';
import { IconTerminal } from '@envsemble/envui/icons/Terminal';
import { IconTune } from '@envsemble/envui/icons/Tune';
import { IconVisibility } from '@envsemble/envui/icons/Visibility';
import { AppFrame, minutesAgo } from './AppScreenFrame.js';

const before = `export async function deliver(event: WebhookEvent) {
  const response = await fetch(event.url, {
    method: 'POST',
    body: JSON.stringify(event.payload),
  });
  if (!response.ok) throw new DeliveryError(response.status);
  return response;
}
`;

const after = `export async function deliver(event: WebhookEvent, attempt = 1) {
  const response = await fetch(event.url, {
    method: 'POST',
    body: JSON.stringify(event.payload),
    signal: AbortSignal.timeout(10_000),
  });
  if (response.status >= 500 && attempt < MAX_ATTEMPTS) {
    await sleep(backoff(attempt));
    return deliver(event, attempt + 1);
  }
  if (!response.ok) throw new DeliveryError(response.status);
  return response;
}
`;

const command = `npm test -- webhooks/deliver.test.ts --repeat 50`;

const output = `✓ retries a 503 up to three times (12 ms)
✓ gives up after MAX_ATTEMPTS (8 ms)
✗ times out a hanging endpoint after 10 s
  Expected: DeliveryError(408)
  Received: AbortError`;

type StepState = 'done' | 'running' | 'queued' | 'failed';

const steps: { label: string; detail: string; state: StepState }[] = [
  { label: 'Read the failing test', detail: 'webhooks/deliver.test.ts · 4 s', state: 'done' },
  { label: 'Run the tests 50 times', detail: '1 failure in 50 runs · 41 s', state: 'failed' },
  { label: 'Patch deliver()', detail: 'src/webhooks/deliver.ts · +6 −1', state: 'done' },
  { label: 'Run the tests 50 times', detail: '50 of 50 passed · 39 s', state: 'done' },
  { label: 'Run the whole suite', detail: '812 of 1,304 tests', state: 'running' },
  { label: 'Open a pull request', detail: 'Waiting for approval', state: 'queued' },
];

/** A run step's state as an icon, in the tone that says it. */
function StepIcon({ state }: { state: StepState }) {
  if (state === 'running') return <Spinner size="sm" label="Running" />;
  if (state === 'done') return <IconCheckCircle tone="success" aria-label="Done" />;
  if (state === 'failed') return <IconError tone="danger" aria-label="Failed" />;
  return (
    <Text render={<span />} emphasis="subtle">
      <IconPending aria-label="Queued" />
    </Text>
  );
}

function Conversation() {
  const { additions, deletions } = countDiffLines(before, after, 'deliver.ts');
  const [running, setRunning] = useState(true);
  const log = useRef<HTMLDivElement>(null);
  // The log opens at its end, on the latest reply, and stays there as the diff renders.
  useLayoutEffect(() => {
    const node = log.current;
    if (!node) return;
    const toEnd = () => (node.scrollTop = node.scrollHeight);
    const observer = new ResizeObserver(toEnd);
    for (const child of node.children) observer.observe(child);
    toEnd();
    return () => observer.disconnect();
  }, []);
  return (
    // The log scrolls between the page's header and the composer. Layout glue: the log takes the
    // height left in the page, which no layout component can say.
    <>
      <MessageList
        ref={log}
        aria-label="Conversation with the agent"
        busy={running}
        busyAuthor="Agent"
        tabIndex={0}
        style={{ flex: 1, minBlockSize: 0, overflowY: 'auto', paddingInline: 'var(--env-space-1)' }}
      >
        <Message from="self" meta={<RelativeTime value={minutesAgo(18)} />}>
          The webhook deliveries in billing-api fail about once a day with a 503 from the partner.
          Can you add retries with backoff, and make sure a hanging endpoint can’t block the queue?
        </Message>
        <Message
          from="other"
          author="Agent"
          meta={<RelativeTime value={minutesAgo(14)} />}
          actions={
            <Button variant="text" size="sm" startIcon={<IconReplay />}>
              Run again
            </Button>
          }
        >
          <Column gap={3}>
            <Text>
              First I ran the delivery tests 50 times against a partner stub that fails at random.
              One case fails today:
            </Text>
            <CodeBlock language="bash" label="Terminal" copyable>
              {command}
            </CodeBlock>
            <CodeBlock label="Output">{output}</CodeBlock>
          </Column>
        </Message>
        <Message
          from="other"
          author="Agent"
          meta={
            <Row align="center" gap={1} render={<span />}>
              <RelativeTime value={minutesAgo(4)} />
              <CopyButton variant="text" size="sm" value={after} aria-label="Copy the change" />
            </Row>
          }
        >
          <Column gap={3}>
            <Text>
              I added up to three retries with exponential backoff for 5xx responses, and a
              10-second timeout on every attempt. All 50 runs pass now; the whole suite is running.
            </Text>
            <Row align="center" gap={2}>
              <Text variant="body-sm" emphasis="muted">
                1 file changed
              </Text>
              <DiffStat additions={additions} deletions={deletions} />
            </Row>
            <CodeDiff
              filename="src/webhooks/deliver.ts"
              language="ts"
              before={before}
              after={after}
              layout="unified"
            />
          </Column>
        </Message>
      </MessageList>
      <Composer
        aria-label="Message the agent"
        placeholder="Reply, or ask for a change"
        running={running}
        onStop={() => setRunning(false)}
        onSend={() => setRunning(true)}
        start={
          <>
            <IconButton variant="text" icon={<IconAttachFile />} aria-label="Attach files" />
            <Badge icon={<IconTerminal />}>billing-api</Badge>
          </>
        }
        description="The agent can run commands in the sandbox and push to agent/* branches."
      />
    </>
  );
}

function RunPanel() {
  const done = steps.filter((step) => step.state === 'done' || step.state === 'failed').length;
  return (
    <Column gap={5} padding={4}>
      <Column gap={3}>
        <Row align="center" justify="between" gap={2}>
          <Text render={<h2 />} variant="title">
            Run
          </Text>
          <Badge tone="primary" icon={<Spinner size="sm" label="Running" />}>
            Running
          </Badge>
        </Row>
        <Progress
          value={done}
          max={steps.length}
          segments={steps.length}
          label="Steps"
          valueText={`${done} of ${steps.length}`}
        />
      </Column>
      <List.Root aria-label="Run log" density="sm">
        {steps.map((step) => (
          <List.Item
            key={`${step.label}-${step.detail}`}
            start={<StepIcon state={step.state} />}
            label={step.label}
            description={step.detail}
            current={step.state === 'running'}
          />
        ))}
      </List.Root>
      <Column gap={3}>
        <Text render={<h3 />} variant="title">
          Usage
        </Text>
        <Progress value={62} label="Context" valueText="124k of 200k tokens" />
        <Progress value={null} label="Sandbox" valueText="Starting the test database" />
      </Column>
      <Column gap={3}>
        <Text render={<h3 />} variant="title">
          Preview
        </Text>
        {/* The empty state. Finding: no empty state component; it is a Surface and a centred
            Column, with the centring and its height as layout glue. */}
        <Surface background="muted" padding={5}>
          <Column gap={3} align="center" style={{ textAlign: 'center' }}>
            <Text render={<span />} emphasis="muted">
              <IconVisibility width="2rem" height="2rem" />
            </Text>
            <Column gap={1} align="center">
              {/* Under the section's title, the state's heading is body text in the default color. */}
              <Text render={<h4 />}>No preview yet</Text>
              <Text variant="body-sm" emphasis="muted">
                A preview deploys once the tests pass.
              </Text>
            </Column>
            <Button variant="secondary" size="sm" startIcon={<IconRocketLaunch />}>
              Deploy preview now
            </Button>
          </Column>
        </Surface>
      </Column>
    </Column>
  );
}

function SettingsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const formId = useId();
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Agent settings"
      description="These apply to new runs in billing-api."
      closeLabel="Cancel"
      actions={
        <Button type="submit" form={formId}>
          Save settings
        </Button>
      }
    >
      <form id={formId} onSubmit={(event) => event.preventDefault()}>
        <Column gap={4}>
          <Select
            label="Model"
            items={[
              { value: 'large', label: 'Large', description: 'Best for multi-file changes' },
              { value: 'fast', label: 'Fast', description: 'Quick edits and questions' },
            ]}
            defaultValue="large"
          />
          <RadioGroup label="Approvals" defaultValue="writes" orientation="vertical">
            <Radio value="always" label="Ask before every command" />
            <Radio
              value="writes"
              label="Ask before writes"
              description="Reading files and running tests never asks."
            />
            <Radio value="never" label="Never ask" />
          </RadioGroup>
          <Slider label="Step limit" defaultValue={40} min={10} max={100} step={5} />
          <Switch label="Run the tests before every commit" defaultChecked />
          <Textarea
            label="Instructions"
            rows={3}
            defaultValue="Prefer small commits. Never change the public API without asking."
          />
        </Column>
      </form>
    </Dialog>
  );
}

const commands: CommandPaletteItem[] = [
  {
    id: 'new',
    label: 'New agent run',
    icon: <IconSmartToy />,
    group: 'Commands',
    end: <Kbd keys={['Ctrl', 'N']} />,
  },
  { id: 'rerun', label: 'Run the failing step again', icon: <IconReplay />, group: 'Commands' },
  {
    id: 'commit',
    label: 'Commit the changes',
    icon: <IconCommit />,
    group: 'Commands',
    end: <Kbd keys={['Ctrl', 'Enter']} />,
  },
  {
    id: 'settings',
    label: 'Agent settings',
    icon: <IconTune />,
    group: 'Commands',
    end: <Kbd keys={['Ctrl', ',']} />,
  },
  {
    id: 'billing',
    label: 'billing-api',
    description: 'northwind/billing-api',
    icon: <IconFolder />,
    group: 'Projects',
  },
  {
    id: 'checkout',
    label: 'checkout-web',
    description: 'northwind/checkout',
    icon: <IconFolder />,
    group: 'Projects',
  },
  {
    id: 'automation',
    label: 'Nightly dependency updates',
    icon: <IconBolt />,
    group: 'Automations',
    end: <Badge tone="primary">New</Badge>,
  },
];

export function AgentScreen({ overlay }: { overlay: 'dialog' | 'palette' | 'none' }) {
  const toast = useToast();
  const [current, setCurrent] = useState('/agents');
  const [searching, setSearching] = useState(overlay === 'palette');
  const [settings, setSettings] = useState(overlay === 'dialog');
  const [query, setQuery] = useState('');
  // The push finished as the screen opened. Dismissed on unmount, as Strict Mode's remount does.
  useEffect(() => {
    const id = toast.show({
      message: 'Pushed 2 commits to agent/webhook-retries.',
      tone: 'success',
      action: { label: 'View', onClick: () => undefined },
    });
    return () => toast.dismiss(id);
  }, [toast]);
  const destinations: Destination[] = places.map((place) => ({
    ...place,
    current: place.href === current,
    onClick: () => setCurrent(place.href),
  }));
  const items = useMemo(
    () =>
      commands.filter((item) =>
        String(item.label).toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [query],
  );
  return (
    <AppFrame destinations={destinations} onSearch={() => setSearching(true)}>
      <Panes.Root behavior="supporting">
        <Panes.Main label="Conversation">
          {/* The page as a column as tall as the pane, so its header stays and the conversation
              takes the rest. Layout glue: Page has no way to fill the pane's height, and its
              header prop would wrap the conversation in a block that can't. */}
          <Page width="md" render={<Column gap={5} />} style={{ blockSize: '100%' }}>
            <PageHeader
              title="Retry failed webhook deliveries"
              breadcrumbs={
                <Text variant="body-sm" emphasis="muted">
                  billing-api · agent/webhook-retries
                </Text>
              }
              meta={<Badge tone="primary">Running</Badge>}
              actions={
                <>
                  <Tooltip content="Agent settings">
                    <IconButton
                      icon={<IconSettings />}
                      aria-label="Agent settings"
                      onClick={() => setSettings(true)}
                    />
                  </Tooltip>
                  <Panes.Trigger variant="secondary">Run</Panes.Trigger>
                  <Button startIcon={<IconCommit />}>Open pull request</Button>
                </>
              }
            />
            <Conversation />
          </Page>
        </Panes.Main>
        <Panes.Supporting label="Run">
          <RunPanel />
        </Panes.Supporting>
      </Panes.Root>
      <CommandPalette
        open={searching}
        onOpenChange={(open) => {
          setSearching(open);
          if (!open) setQuery('');
        }}
        aria-label="Search and run commands"
        placeholder="Search or run a command"
        inputValue={query}
        onInputValueChange={setQuery}
        items={items}
        onAction={(item) => {
          if (item.id === 'settings') setSettings(true);
        }}
        hints={[
          { keys: ['↑', '↓'], label: 'Move' },
          { keys: ['Enter'], label: 'Run' },
          { keys: ['Esc'], label: 'Close' },
        ]}
      />
      <SettingsDialog open={settings} onOpenChange={setSettings} />
    </AppFrame>
  );
}

const places = [
  { label: 'Overview', href: '/', icon: <IconDashboard /> },
  { label: 'Projects', href: '/projects', icon: <IconFolder /> },
  { label: 'Agents', href: '/agents', icon: <IconSmartToy />, count: 2 },
  { label: 'Deployments', href: '/deployments', icon: <IconRocketLaunch /> },
  { label: 'Monitoring', href: '/monitoring', icon: <IconMonitoring /> },
  { label: 'Settings', href: '/settings', icon: <IconSettings />, group: 'Organization' },
];
