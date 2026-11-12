import { useEffect } from 'react';
import {
  Alert,
  Avatar,
  Badge,
  NavigationBar,
  Button,
  Card,
  Checkbox,
  Column,
  Combobox,
  NavigationDrawer,
  IconButton,
  List,
  Menu,
  Meter,
  Radio,
  RadioGroup,
  NavigationRail,
  Row,
  SegmentedControl,
  Progress,
  Select,
  Slider,
  Surface,
  Switch,
  Tabs,
  TextField,
  Textarea,
  Theme,
  ToastProvider,
  Toolbar,
  Tooltip,
  useToast,
  type Destination,
} from '@envsemble/envui';
import { IconFormatBold } from '@envsemble/envui/icons/FormatBold';
import { IconFormatItalic } from '@envsemble/envui/icons/FormatItalic';
import { IconHome } from '@envsemble/envui/icons/Home';
import { IconInbox } from '@envsemble/envui/icons/Inbox';
import { IconSettings } from '@envsemble/envui/icons/Settings';
import { planOptions } from './SelectOptions.fixture.js';

const destinations: Destination[] = [
  { label: 'Home', icon: <IconHome />, href: '#home', current: true },
  { label: 'Inbox', icon: <IconInbox />, href: '#inbox', count: 3 },
  { label: 'Settings', icon: <IconSettings />, href: '#settings' },
];

/** Toasts in a few tones, one with an action, kept until the page closes. */
function Toasts() {
  const toast = useToast();
  useEffect(() => {
    toast.show({ message: 'Neutral toast', duration: 0 });
    toast.show({ message: 'Success toast', tone: 'success', duration: 0 });
    toast.show({
      message: 'Error toast',
      tone: 'danger',
      action: { label: 'Retry', onClick: () => {} },
    });
  }, [toast]);
  return null;
}

/**
 * Every component that has color properties, at rest and disabled, with none set:
 * DefaultColors.test.tsx forces each control into its states and compares the colors it paints
 * with those the integration branch painted, so envUI's own colors can't drift.
 */
export default function DefaultColorsFixture() {
  return (
    <Theme theme="light" className="fixture-section" data-testid="default-colors">
      <h2>Default colors</h2>
      <Column gap={3}>
        <Row gap={2} wrap>
          <Button>Primary</Button>
          <Button tone="accent">Accent</Button>
          <Button tone="danger">Danger</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="outline" tone="danger">
            Outline danger
          </Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="ghost" tone="danger">
            Ghost danger
          </Button>
          <Button variant="text">Text</Button>
          <Button variant="text" tone="danger">
            Text danger
          </Button>
          <IconButton icon={<IconSettings />} aria-label="Secondary icon" />
          <IconButton variant="ghost" icon={<IconSettings />} aria-label="Ghost icon" />
          <IconButton variant="text" icon={<IconSettings />} aria-label="Text icon" />
          <IconButton
            variant="text"
            tone="danger"
            icon={<IconSettings />}
            aria-label="Danger icon"
          />
        </Row>
        <Toolbar.Root aria-label="Formatting">
          <Toolbar.Button icon={<IconFormatBold />} label="Bold" pressed />
          <Toolbar.Button icon={<IconFormatItalic />} label="Italic" pressed={false} />
        </Toolbar.Root>
        <Surface background="muted" padding={3}>
          <Card href="#card">Interactive card</Card>
        </Surface>
        {(['default', 'muted', 'page', 'raised'] as const).map((background) => (
          <Surface key={background} background={background} padding={2}>
            {background} surface
          </Surface>
        ))}
        <List.Root>
          <List.Item
            interactive
            label={
              <a href="#row" data-row-target>
                Row
              </a>
            }
          />
          <List.Item
            interactive
            current
            label={
              <a href="#current" data-row-target>
                Current row
              </a>
            }
          />
        </List.Root>
        <Menu.Root aria-label="Actions" defaultOpen trigger={<Button>Actions</Button>}>
          <Menu.Item icon={<IconSettings />}>Preferences</Menu.Item>
          <Menu.Item>Rename</Menu.Item>
        </Menu.Root>
        <NavigationDrawer aria-label="Drawer destinations" destinations={destinations} />
        <NavigationRail aria-label="Rail destinations" destinations={destinations} />
        <NavigationBar aria-label="Bar destinations" destinations={destinations} />
        <Tabs
          aria-label="Tabs"
          items={[
            { value: 'one', button: <Button>First</Button>, content: 'First panel' },
            {
              value: 'two',
              button: <Button variant="secondary">Second</Button>,
              content: 'Second panel',
            },
          ]}
        />
        <SegmentedControl
          aria-label="Status"
          value="open"
          onValueChange={() => {}}
          items={[
            { value: 'open', label: 'Open' },
            { value: 'done', label: 'Done' },
          ]}
        />
        <TextField label="Name" defaultValue="Roadmap" />
        <TextField label="Invalid" error="Required" />
        <Textarea label="Notes" defaultValue="Notes" />
        <Select label="Plan" items={planOptions} defaultValue="starter" />
        <Select label="Large plan" size="lg" items={planOptions} defaultValue="starter" />
        <Checkbox label="Checked" defaultChecked />
        <Checkbox label="Unchecked" />
        <RadioGroup orientation="vertical" defaultValue="a">
          <Radio value="a" label="Chosen row" />
          <Radio value="b" label="Other row" />
        </RadioGroup>
        <Switch label="On" defaultChecked />
        <Switch label="Off" />
        <Slider label="Volume" defaultValue={40} />
        <Meter label="Storage" value={60} />
        <Progress label="Upload" value={30} />
        <Row gap={2} wrap>
          <Badge>Neutral</Badge>
          <Badge tone="accent" variant="solid">
            Solid
          </Badge>
          <Badge tone="danger" variant="outline">
            Outline
          </Badge>
          <Badge count={4} aria-label="4 items" />
          <Avatar name="Alex Morgan" />
          <Avatar name="Sam Lee" hue="seafoam" />
        </Row>
        {([undefined, 'success', 'warning', 'danger'] as const).map((tone) => (
          <Alert
            key={tone ?? 'info'}
            tone={tone}
            title={`${tone ?? 'info'} alert`}
            onDismiss={() => {}}
          >
            Message
          </Alert>
        ))}
        <Tooltip content="Tip" defaultOpen>
          <Button variant="secondary">With a tooltip</Button>
        </Tooltip>
        <Row gap={2} wrap>
          <Button disabled>Disabled primary</Button>
          <Button variant="secondary" disabled>
            Disabled secondary
          </Button>
          <Button variant="outline" disabled>
            Disabled outline
          </Button>
          <Button variant="ghost" disabled>
            Disabled ghost
          </Button>
          <Button variant="text" disabled>
            Disabled text
          </Button>
        </Row>
        <TextField label="Disabled name" defaultValue="Roadmap" disabled />
        <Checkbox label="Disabled checked" defaultChecked disabled />
        <Switch label="Disabled on" defaultChecked disabled />
        <Slider label="Disabled volume" defaultValue={40} disabled />
        <ToastProvider>
          <Toasts />
        </ToastProvider>
        <Combobox
          multiple
          label="Reviewers"
          items={[
            { value: 'alex', label: 'Alex Morgan' },
            { value: 'sam', label: 'Sam Lee' },
          ]}
          defaultValue={['alex']}
        />
      </Column>
    </Theme>
  );
}
