import { Stack, TextField } from '@envsemble/envui';
import { Search } from '@envsemble/envui/icons/Search';

export default function Variants() {
  return (
    // As wide as a form column.
    <Stack style={{ inlineSize: 'min(100%, 24rem)' }}>
      <TextField label="Project name" name="project" defaultValue="Northwind launch" />
      <TextField variant="plain" label="Title" name="title" defaultValue="Quarterly report" />
      <TextField
        variant="quiet"
        showLabel={false}
        label="Find projects"
        placeholder="Find projects"
        startIcon={<Search />}
      />
    </Stack>
  );
}
