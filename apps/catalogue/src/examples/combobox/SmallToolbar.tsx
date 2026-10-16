import { ActionGroup, Button, Combobox, Surface, type ComboboxGroup } from '@envsemble/envui';
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
      tone="pane"
      padding={1}
      corners="pill"
      role="group"
      aria-label="Document toolbar"
      render={<ActionGroup />}
    >
      <Combobox
        size="sm"
        showLabel={false}
        aria-label="Document"
        placeholder="Document"
        items={documents}
      />
      <Button variant="outlined" size="sm">
        Open
      </Button>
    </Surface>
  );
}
