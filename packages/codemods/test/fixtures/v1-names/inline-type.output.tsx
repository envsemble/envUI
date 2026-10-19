import { Button, type Menu, Stat, type Table } from '@envsemble/envui';

export function Summary(props: { item: Menu.ItemProps; tone: Stat.TrendTone; sort: Table.SortDirection }) {
  return (
    <Stat.Group>
      <Button>{props.item.children}</Button>
    </Stat.Group>
  );
}
