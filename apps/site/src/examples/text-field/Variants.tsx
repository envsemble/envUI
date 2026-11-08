import { Column, TextField } from '@envsemble/envui';
import { IconSearch } from '@envsemble/envui/icons/Search';

export default function Variants() {
  return (
    // As wide as a form column.
    <Column gap={5} style={{ inlineSize: 'min(100%, 22rem)' }}>
      <TextField label="Project name" name="project" defaultValue="Northwind launch" />
      <TextField
        variant="ghost"
        visibleLabel={false}
        label="Find projects"
        placeholder="Find projects"
        startIcon={<IconSearch />}
      />
    </Column>
  );
}
