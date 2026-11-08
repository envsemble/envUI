import { Button, Combobox, Surface, type ComboboxGroup, Row } from '@envsemble/envui';
import { IconDescription } from '@envsemble/envui/icons/Description';
import { IconFolder } from '@envsemble/envui/icons/Folder';

const documents: ComboboxGroup[] = [
  {
    label: 'Recent',
    items: [
      { value: 'quarterly-report', label: 'Quarterly report', start: <IconDescription /> },
      { value: 'release-notes', label: 'Release notes', start: <IconDescription /> },
      { value: 'design-review', label: 'Design review', start: <IconDescription /> },
    ],
  },
  {
    label: 'Folders',
    items: [
      { value: 'research/interviews', label: 'research/interviews', start: <IconFolder /> },
      { value: 'research/surveys', label: 'research/surveys', start: <IconFolder /> },
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
      render={<Row wrap align="center" gap={4} />}
    >
      <Combobox
        size="sm"
        visibleLabel={false}
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
