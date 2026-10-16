import type { ComponentProps } from 'react';
import { Button, List, Menu, Pager, Table, TextField, Toast, useToast } from '@envsemble/envui';
import type { AlertTone } from '@envsemble/envui';

export type RootProps = ComponentProps<typeof Menu.Root> & { tone?: AlertTone; sort?: Table.SortDirection };

function Save() {
  const toast = useToast();
  return <Button onClick={() => toast.show({ title: 'Saved' })}>Save</Button>;
}

export function Page(props: RootProps & { item?: Menu.ItemProps }) {
  return (
    <Toast.Provider>
      <Menu.Root trigger={<Button>Northwind Labs</Button>}>
        <Menu.Item>Rename</Menu.Item>
        <Menu.Separator />
      </Menu.Root>
      <TextField label="Name" />
      <List.Root>
        <List.Item title="Alex Morgan" />
      </List.Root>
      <Table.Root>
        <Table.Body />
      </Table.Root>
      <Pager.Root>
        <Pager.Next href="/next" />
      </Pager.Root>
      <Save />
    </Toast.Provider>
  );
}
