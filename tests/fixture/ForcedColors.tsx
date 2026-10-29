// The forced-colors spec's page: one component of each kind in its states, side by side, each part
// named by a test id, so the spec can compare a state with its rest under forced colors.
import { createRoot } from 'react-dom/client';
import {
  Button,
  Calendar,
  Checkbox,
  IconButton,
  DocumentTabs,
  List,
  Menu,
  Menubar,
  Drawer,
  Rail,
  Pagination,
  Radio,
  RadioGroup,
  Rating,
  SegmentedControl,
  Select,
  Switch,
  Table,
  TableOfContents,
  Tabs,
  TextField,
  Theme,
  Tree,
  Field,
  Toolbar,
  type ButtonProps,
} from '@envsemble/envui';
import { Close } from '@envsemble/envui/icons/Close';
import { Home } from '@envsemble/envui/icons/Home';
import { Inbox } from '@envsemble/envui/icons/Inbox';
import '@envsemble/envui/styles.css';
// Internal: the lists of times and months the pickers open, shown here without their popups.
import { TimeList } from '../../packages/ui/src/forms/internal/TimeList.js';
import { MonthGrid } from '../../packages/ui/src/forms/internal/MonthGrid.js';

const noop = () => {};

/**
 * Every designed pair of variant and tone, each of which must keep a visible edge under forced
 * colors.
 */
const variants = [
  ['primary', { variant: 'primary' }],
  ['primary-accent', { variant: 'primary', tone: 'accent' }],
  ['primary-danger', { variant: 'primary', tone: 'danger' }],
  ['secondary', { variant: 'secondary' }],
  ['outline', { variant: 'outline' }],
  ['outline-danger', { variant: 'outline', tone: 'danger' }],
  ['ghost', { variant: 'ghost' }],
  ['ghost-danger', { variant: 'ghost', tone: 'danger' }],
  ['text', { variant: 'text' }],
  ['text-danger', { variant: 'text', tone: 'danger' }],
] as const;

function Page() {
  return (
    <Theme theme="light" style={{ display: 'grid', gap: '1.5rem', padding: '1rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Button data-testid="button">Save</Button>
        <Button data-testid="button-disabled" disabled>
          Save
        </Button>
        <Button data-testid="button-focus">Focus me</Button>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {variants.map(([name, emphasis]) => (
          <Button
            key={name}
            {...({ ...emphasis, children: name } as ButtonProps)}
            data-testid={`variant-${name}`}
          />
        ))}
        <IconButton icon={<Close />} aria-label="Close" data-testid="variant-icon" />
        <IconButton
          icon={<Close />}
          aria-label="Close"
          variant="text"
          data-testid="variant-icon-text"
        />
      </div>
      <SegmentedControl
        aria-label="View"
        value="board"
        onValueChange={noop}
        items={[
          { value: 'board', label: 'Board' },
          { value: 'list', label: 'List' },
        ]}
      />
      <Tabs
        aria-label="Sections"
        defaultValue="one"
        items={[
          { value: 'one', button: <Button>One</Button>, content: 'First' },
          { value: 'two', button: <Button>Two</Button>, content: 'Second' },
        ]}
      />
      <Drawer
        aria-label="Places"
        destinations={[
          { label: 'Home', icon: <Home />, href: '#home', current: true },
          { label: 'Inbox', icon: <Inbox />, href: '#inbox', count: 3 },
        ]}
      />
      <Rail
        aria-label="Rail places"
        destinations={[
          { label: 'Home', icon: <Home />, href: '#home', current: true },
          { label: 'Inbox', icon: <Inbox />, href: '#inbox', count: 3 },
        ]}
      />
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Checkbox label="Checked" defaultChecked />
        <Checkbox label="Unchecked" />
        <Switch label="On" defaultChecked />
        <Switch label="Off" />
      </div>
      <RadioGroup label="Plan" defaultValue="team">
        <Radio value="team" label="Team" />
        <Radio value="solo" label="Solo" />
      </RadioGroup>
      <Toolbar.Root aria-label="Formatting">
        <Toolbar.Button icon={<Close />} label="Pressed" pressed data-testid="toolbar-pressed" />
        <Toolbar.Button icon={<Close />} label="Released" data-testid="toolbar-released" />
      </Toolbar.Root>
      <Field.Root invalid>
        <Field.Label>Invalid field part</Field.Label>
        <Field.Control data-testid="field-invalid" />
      </Field.Root>
      <Field.Root>
        <Field.Label>Valid field part</Field.Label>
        <Field.Control data-testid="field-valid" />
      </Field.Root>
      <RadioGroup orientation="vertical" label="Role" defaultValue="member">
        <Radio value="member" label="Member" />
        <Radio value="admin" label="Admin" />
      </RadioGroup>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'start' }}>
        <TextField label="Valid" data-testid="field" defaultValue="Ada" />
        <TextField
          label="Invalid"
          data-testid="field-invalid"
          defaultValue="Ada"
          error="Too short"
        />
        <TextField label="Disabled" data-testid="field-disabled" defaultValue="Ada" disabled />
      </div>
      <Table.Root aria-label="Reports">
        <Table.Body>
          <Table.Row interactive selected data-testid="row-selected">
            <Table.Cell>Tokens</Table.Cell>
          </Table.Row>
          <Table.Row interactive data-testid="row">
            <Table.Cell>Layers</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table.Root>
      <List.Root aria-label="Slides">
        <List.Item current label="Current slide" data-testid="list-selected" />
        <List.Item label="Other slide" data-testid="list-item" />
      </List.Root>
      <Tree
        aria-label="Files"
        items={[
          { id: 'a', depth: 0, label: 'Selected file' },
          { id: 'b', depth: 0, label: 'Other file' },
        ]}
        value="a"
        onAction={noop}
        onExpandedChange={noop}
      />
      <Calendar defaultValue="2026-10-14" />
      <TimeList aria-label="Times" value={9 * 60 + 30} onValueChange={noop} min={8 * 60} />
      <MonthGrid
        value={2026 * 12 + 9}
        onChoose={noop}
        min={2026 * 12 + 1}
        max={undefined}
        locale="en-GB"
        previousYearLabel="Previous year"
        nextYearLabel="Next year"
      />
      <Pagination page={2} pageSize={10} total={50} onPageChange={noop} />
      <DocumentTabs
        aria-label="Documents"
        value="a"
        onValueChange={noop}
        onClose={noop}
        items={[
          { value: 'a', label: 'Active.md' },
          { value: 'b', label: 'Other.md' },
        ]}
      />
      <Rating value={3} />
      {/* The first section, at the top of the page, is the current one. */}
      <TableOfContents
        aria-label="Sections"
        items={[
          { id: 'forced-first', label: 'First section' },
          { id: 'forced-second', label: 'Second section' },
        ]}
      />
      <p id="forced-first">First section</p>
      <p id="forced-second">Second section</p>
      <Menubar.Root aria-label="Application menu">
        {/* Held open, so its trigger shows the open state Base UI gives it. */}
        <Menubar.Menu label="File" open>
          <Menu.Item>New document</Menu.Item>
        </Menubar.Menu>
      </Menubar.Root>
      <Select
        label="Plan type"
        defaultValue="team"
        items={[
          { value: 'team', label: 'Team' },
          { value: 'solo', label: 'Solo' },
        ]}
      />
      <Menu.Root aria-label="View options" defaultOpen trigger={<Button>Options</Button>}>
        <Menu.CheckboxItem checked onCheckedChange={noop}>
          Wrap lines
        </Menu.CheckboxItem>
        <Menu.CheckboxItem checked={false} onCheckedChange={noop}>
          Show minimap
        </Menu.CheckboxItem>
      </Menu.Root>
    </Theme>
  );
}

createRoot(document.getElementById('root')!).render(<Page />);
document.body.dataset.stylesReady = '';
