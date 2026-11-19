import { Column, IconButton, Kbd, Row, SearchField, TextField } from '@envsemble/envui';
import { IconEuro } from '@envsemble/envui/icons/Euro';
import { IconFilterList } from '@envsemble/envui/icons/FilterList';

export default function ContentAffixes() {
  return (
    <Column gap={4} style={{ inlineSize: 'min(100%, 24rem)' }}>
      <TextField
        label="Price"
        name="price"
        type="number"
        prefix={
          <Row render={<span />} align="center" gap={1}>
            <IconEuro /> EUR
          </Row>
        }
        suffix="per seat"
        defaultValue="12"
      />
      <SearchField
        label="Search issues"
        placeholder="Search issues"
        endAction={<IconButton icon={<IconFilterList />} aria-label="Filters" />}
      />
      <SearchField
        label="Search the docs"
        placeholder="Search the docs"
        endAction={<Kbd keys={['/']} />}
      />
    </Column>
  );
}
