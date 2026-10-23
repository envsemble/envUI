import * as ui from '@envsemble/envui';

type ItemProps = ui.MenuItemProps;
type MenuComponent = typeof ui.Menu;
type TableProps = React.ComponentProps<typeof ui.Table>;

export const parts = [ui.MenuItem, ui.Input];
export const { DirectionLinks } = ui;

export function Settings(props: { item: ItemProps; table: TableProps; menu?: MenuComponent }) {
  return (
    <ui.Toast.Provider>
      <ui.Menu trigger="Settings">
        <ui.MenuItem {...props.item}>Profile</ui.MenuItem>
      </ui.Menu>
      <ui.Input label="Organization" defaultValue="Northwind Labs" />
      <ui.DirectionLinks>
        <ui.DirectionLink direction="next" href="/settings/members" />
        <ui.DirectionLink direction={props.item.title} href="/settings/teams" />
      </ui.DirectionLinks>
      <ui.LoadingBar />
      <ui.Row title="Members" />
    </ui.Toast.Provider>
  );
}
