import {
  Alert,
  Avatar,
  Badge,
  Bar,
  Button,
  Card,
  Checkbox,
  Column,
  Combobox,
  Drawer,
  IconButton,
  List,
  Menu,
  Radio,
  RadioGroup,
  Rail,
  Row,
  SegmentedControl,
  Select,
  Slider,
  Surface,
  Switch,
  Tabs,
  TextField,
  Textarea,
  Theme,
  Toolbar,
  Tooltip,
  type Destination,
} from '@envsemble/envui';
import { FormatBold } from '@envsemble/envui/icons/FormatBold';
import { FormatItalic } from '@envsemble/envui/icons/FormatItalic';
import { Home } from '@envsemble/envui/icons/Home';
import { Inbox } from '@envsemble/envui/icons/Inbox';
import { Settings } from '@envsemble/envui/icons/Settings';
import { planOptions } from './SelectOptions.js';

const destinations: Destination[] = [
  { label: 'Home', icon: <Home />, href: '#home', current: true },
  { label: 'Inbox', icon: <Inbox />, href: '#inbox', count: 3 },
  { label: 'Settings', icon: <Settings />, href: '#settings' },
];

/**
 * Every component that has color properties, at rest, with none set: DefaultColors.spec.ts forces
 * each control into its states and compares the colors it paints with those the integration branch
 * painted, so envUI's own colors can't drift.
 */
export function DefaultColors() {
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
          <IconButton icon={<Settings />} aria-label="Secondary icon" />
          <IconButton variant="ghost" icon={<Settings />} aria-label="Ghost icon" />
          <IconButton variant="text" icon={<Settings />} aria-label="Text icon" />
          <IconButton variant="text" tone="danger" icon={<Settings />} aria-label="Danger icon" />
        </Row>
        <Toolbar.Root aria-label="Formatting">
          <Toolbar.Button icon={<FormatBold />} label="Bold" pressed />
          <Toolbar.Button icon={<FormatItalic />} label="Italic" pressed={false} />
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
            selected
            label={
              <a href="#current" data-row-target>
                Current row
              </a>
            }
          />
        </List.Root>
        <Menu.Root aria-label="Actions" defaultOpen trigger={<Button>Actions</Button>}>
          <Menu.Item icon={<Settings />}>Preferences</Menu.Item>
          <Menu.Item>Rename</Menu.Item>
        </Menu.Root>
        <Drawer aria-label="Drawer destinations" destinations={destinations} />
        <Rail aria-label="Rail destinations" destinations={destinations} />
        <Bar aria-label="Bar destinations" destinations={destinations} />
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
        <Select label="Outline plan" variant="outline" items={planOptions} defaultValue="starter" />
        <Checkbox label="Checked" defaultChecked />
        <Checkbox label="Unchecked" />
        <RadioGroup orientation="vertical" defaultValue="a">
          <Radio value="a" label="Chosen row" />
          <Radio value="b" label="Other row" />
        </RadioGroup>
        <Switch label="On" defaultChecked />
        <Switch label="Off" />
        <Slider label="Volume" defaultValue={40} />
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
