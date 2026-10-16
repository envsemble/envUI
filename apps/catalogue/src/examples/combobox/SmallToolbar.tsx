import { Button, Combobox, Surface, type ComboboxGroup, Stack } from '@envsemble/envui';
import { Description } from '@envsemble/envui/icons/Description';
import { Folder } from '@envsemble/envui/icons/Folder';

const documents: ComboboxGroup[] = [
  {
    label: 'Recent',
    items: [
      { value: 'quarterly-report', label: 'Quarterly report', leading: <Description /> },
      { value: 'release-notes', label: 'Release notes', leading: <Description /> },
      { value: 'design-review', label: 'Design review', leading: <Description /> },
    ],
  },
  {
    label: 'Folders',
    items: [
      { value: 'research/interviews', label: 'research/interviews', leading: <Folder /> },
      { value: 'research/surveys', label: 'research/surveys', leading: <Folder /> },
    ],
  },
];

export default function SmallToolbar() {
  return (
    <Surface
      background="default"
      padding={1}
      radius="full"
      role="group"
      aria-label="Document toolbar"
      render={<Stack direction="row" wrap align="center" gap={4} />}
    >
      <Combobox
        size="sm"
        showLabel={false}
        aria-label="Document"
        placeholder="Document"
        items={documents}
      />
      <Button variant="outline" size="sm">
        Open
      </Button>
    </Surface>
  );
}
