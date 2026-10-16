import { Button, type MenuItemProps, type StatTrendTone, StatGroup, type TableSortDirection } from '@envsemble/envui';

export function Summary(props: { item: MenuItemProps; tone: StatTrendTone; sort: TableSortDirection }) {
  return (
    <StatGroup>
      <Button>{props.item.children}</Button>
    </StatGroup>
  );
}
