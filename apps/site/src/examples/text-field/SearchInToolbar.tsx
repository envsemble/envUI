import { IconButton, Row, SearchField } from '@envsemble/envui';
import { IconFilterList } from '@envsemble/envui/icons/FilterList';
import { IconGridView } from '@envsemble/envui/icons/GridView';
import { IconSort } from '@envsemble/envui/icons/Sort';

export default function SearchInToolbar() {
  return (
    // A row of quiet controls above a list of files.
    <Row align="center" gap={1} style={{ inlineSize: 'min(100%, 26rem)' }}>
      <SearchField
        variant="ghost"
        label="Search files"
        placeholder="Search files"
        style={{ flex: '1 1 auto' }}
      />
      <IconButton variant="ghost" icon={<IconFilterList />} aria-label="Filter" />
      <IconButton variant="ghost" icon={<IconSort />} aria-label="Sort" />
      <IconButton variant="ghost" icon={<IconGridView />} aria-label="Show as grid" />
    </Row>
  );
}
