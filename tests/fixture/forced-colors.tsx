// The forced-colors spec's page: one component of each kind in its states, side by side, each part
// named by a test id, so the spec can compare a state with its rest under forced colors.
import { createRoot } from 'react-dom/client';
import {
  Button,
  Calendar,
  Checkbox,
  IconButton,
  DocumentTabs,
  Menu,
  Menubar,
  NavList,
  Pagination,
  Radio,
  RadioGroup,
  Rating,
  SegmentedControl,
  Select,
  Switch,
  Table,
  Tabs,
  TextField,
  Theme,
  Tree,
  CloseButton,
  Field,
  Toolbar,
  type ButtonProps,
} from '@envsemble/envui';
import { Close } from '@envsemble/envui/icons/Close';
import '@envsemble/envui/styles.css';

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
        <CloseButton data-testid="variant-close" />
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
        options={[
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
      <NavList.Root aria-label="Places">
        <NavList.Item href="#home" selected data-testid="nav-selected">
          Home
        </NavList.Item>
        <NavList.Item href="#inbox" data-testid="nav">
          Inbox
        </NavList.Item>
        <NavList.Item disabled data-testid="nav-disabled">
          Archive
        </NavList.Item>
      </NavList.Root>
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
      <RadioGroup variant="rows" label="Role" defaultValue="member">
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
      <Pagination page={2} pageSize={10} total={50} onPageChange={noop} />
      <DocumentTabs
        aria-label="Documents"
        value="a"
        onValueChange={noop}
        onClose={noop}
        items={[
          { id: 'a', label: 'Active.md' },
          { id: 'b', label: 'Other.md' },
        ]}
      />
      <Rating value={3} />
      <Menubar.Root aria-label="Application menu">
        {/* Held open, so its trigger shows the open state Base UI gives it. */}
        <Menubar.Menu label="File" open>
          <Menu.Item>New document</Menu.Item>
        </Menubar.Menu>
      </Menubar.Root>
      <Select
        label="Plan type"
        defaultValue="team"
        options={[
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
