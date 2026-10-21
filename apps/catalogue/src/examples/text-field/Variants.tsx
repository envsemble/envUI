import { Column, TextField } from '@envsemble/envui';
import { Search } from '@envsemble/envui/icons/Search';

export default function Variants() {
  return (
    // As wide as a form column.
    <Column gap={4} style={{ inlineSize: 'min(100%, 24rem)' }}>
      <TextField label="Project name" name="project" defaultValue="Northwind launch" />
      <TextField variant="underline" label="Title" name="title" defaultValue="Quarterly report" />
      <TextField
        variant="ghost"
        showLabel={false}
        label="Find projects"
        placeholder="Find projects"
        startIcon={<Search />}
      />
    </Column>
  );
}
