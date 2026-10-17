import { List, Menu, NavList, OrganizationSwitcher, Table, Tree } from '@envsemble/envui';

export function Navigation({ rows, organizations, orgId, switchTo, open, sort, count }) {
  return (
    <>
      <Menu.Root aria-label="Actions" trigger={<button>More</button>}>
        <Menu.Item trailing={count} onClick={open}>
          Comments
        </Menu.Item>
      </Menu.Root>
      <NavList.Root>
        <NavList.Item href="/inbox" trailing={<span>3</span>}>
          Inbox
        </NavList.Item>
      </NavList.Root>
      <OrganizationSwitcher
        organizations={organizations}
        currentOrganizationId={orgId}
        onSelect={switchTo}
      />
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
