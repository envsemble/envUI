import * as ui from '@envsemble/envui';

type ItemProps = ui.Menu.ItemProps;
type MenuComponent = typeof ui.Menu.Root;
type TableProps = React.ComponentProps<typeof ui.Table.Root>;

export const parts = [ui.Menu.Item, ui.TextField];
export const { DirectionLinks } = ui;

export function Settings(props: { item: ItemProps; table: TableProps; menu?: MenuComponent }) {
  return (
    <ui.Toast.Provider>
      <ui.Menu.Root trigger="Settings">
        <ui.Menu.Item {...props.item}>Profile</ui.Menu.Item>
      </ui.Menu.Root>
      <ui.TextField label="Organization" defaultValue="Northwind Labs" />
      <ui.Pager.Root>
        <ui.Pager.Next href="/settings/members" />
        <ui.DirectionLink direction={props.item.title} href="/settings/teams" />
      </ui.Pager.Root>
      <ui.LoadingBar />
      <ui.List.Item title="Members" />
    </ui.Toast.Provider>
  );
}
