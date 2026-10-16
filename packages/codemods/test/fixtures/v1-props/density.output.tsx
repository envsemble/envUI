import { Select, Table, Tree, Tabs, Surface, Menu, Button } from '@envsemble/envui';

export function Toolbar({ options, items, density }) {
  return (
    <Surface tone="canvas">
      <Select label="Sort" options={options} size="sm" />
      <Tabs size="sm" items={[]} aria-label="Views" />
      <Tree aria-label="Files" items={items} density="md" />
      <Tree aria-label="Files" items={items} />
      <Table.Root aria-label="Reports" density={density}>
        <Table.Body />
      </Table.Root>
      <Table.Root aria-label="Reports" density="sm" />
      <Menu.Root trigger={<Button>Open</Button>}>
        <Menu.Item>Rename</Menu.Item>
      </Menu.Root>
    </Surface>
  );
}
