import { Select, Table, Tree, Tabs, Surface, Menu, Button } from '@envsemble/envui';

export function Toolbar({ options, items, density }) {
  return (
    <Surface density="compact" tone="canvas">
      <Select label="Sort" options={options} density="compact" />
      <Tabs size="compact" items={[]} aria-label="Views" />
      <Tree aria-label="Files" items={items} density="standard" />
      <Tree aria-label="Files" items={items} density="compact" />
      <Table.Root aria-label="Reports" density={density}>
        <Table.Body />
      </Table.Root>
      <Table.Root aria-label="Reports" density="compact" />
      <Menu.Root trigger={<Button>Open</Button>} density="compact">
        <Menu.Item>Rename</Menu.Item>
      </Menu.Root>
    </Surface>
  );
}
