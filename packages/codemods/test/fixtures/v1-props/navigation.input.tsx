import { List, Menu, Table, Tree } from '@envsemble/envui';

export function Navigation({ rows, open, sort, count }) {
  return (
    <>
      <Menu.Root aria-label="Actions" trigger={<button>More</button>}>
        <Menu.Item trailing={count} onClick={open}>
          Comments
        </Menu.Item>
      </Menu.Root>
      <Tree
        aria-label="Files"
        items={rows}
        selectedId="readme"
        onOpen={open}
        onExpandedChange={open}
      />
      <Table.Root aria-label="Files">
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell onSort={sort}>Name</Table.HeaderCell>
          </Table.Row>
        </Table.Head>
      </Table.Root>
      <List.Root>
        <List.Item title="Theme" detail="Light" />
      </List.Root>
    </>
  );
}
