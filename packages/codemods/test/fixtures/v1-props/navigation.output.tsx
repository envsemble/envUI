import { List, Menu, NavList, OrganizationSwitcher, Table, Tree } from '@envsemble/envui';

export function Navigation({ rows, organizations, orgId, switchTo, open, sort, count }) {
  return (
    <>
      <Menu.Root aria-label="Actions" trigger={<button>More</button>}>
        <Menu.Item end={count} onClick={open}>
          Comments
        </Menu.Item>
      </Menu.Root>
      <NavList.Root>
        <NavList.Item href="/inbox" end={<span>3</span>}>
          Inbox
        </NavList.Item>
      </NavList.Root>
      <OrganizationSwitcher
        items={[{ id: 'northwind', label: 'Northwind', description: 'Admin' }]}
        value={orgId}
        onValueChange={switchTo}
        triggerClassName="org-trigger"
      />
      <Tree
        aria-label="Files"
        items={rows}
        value="readme"
        onAction={open}
        onExpandedChange={open}
      />
      <Table.Root aria-label="Files">
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell onSortChange={sort}>Name</Table.HeaderCell>
          </Table.Row>
        </Table.Head>
      </Table.Root>
      <List.Root>
        <List.Item label="Theme" description="Light" />
      </List.Root>
    </>
  );
}
