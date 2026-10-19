import { useState } from 'react';
import { Button, Menu, Stack, Text } from '@envsemble/envui';
import { Visibility } from '@envsemble/envui/icons/Visibility';

const sortLabels: Record<string, string> = {
  name: 'name',
  changed: 'date changed',
  size: 'size',
};

export default function Choices() {
  const [sort, setSort] = useState('name');
  const [hiddenFiles, setHiddenFiles] = useState(false);
  const [extensions, setExtensions] = useState(true);
  return (
    <Stack align="start">
      <Menu.Root
        aria-label="View options"
        align="start"
        trigger={
          <Button variant="secondary" startIcon={<Visibility />}>
            View
          </Button>
        }
      >
        <Menu.RadioGroup label="Sort by" value={sort} onValueChange={setSort}>
          <Menu.RadioItem value="name">Name</Menu.RadioItem>
          <Menu.RadioItem value="changed" description="Most recently changed first">
            Date changed
          </Menu.RadioItem>
          <Menu.RadioItem value="size">Size</Menu.RadioItem>
        </Menu.RadioGroup>
        <Menu.Group label="Show">
          <Menu.CheckboxItem checked={hiddenFiles} onCheckedChange={setHiddenFiles}>
            Hidden files
          </Menu.CheckboxItem>
          <Menu.CheckboxItem checked={extensions} onCheckedChange={setExtensions}>
            File extensions
          </Menu.CheckboxItem>
        </Menu.Group>
      </Menu.Root>
      <Text variant="body-sm">
        Sorted by {sortLabels[sort]}; hidden files {hiddenFiles ? 'shown' : 'hidden'}; extensions{' '}
        {extensions ? 'shown' : 'hidden'}.
      </Text>
    </Stack>
  );
}
