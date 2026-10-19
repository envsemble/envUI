import { IconButton, Stack, Tooltip } from '@envsemble/envui';
import { Folder } from '@envsemble/envui/icons/Folder';
import { History } from '@envsemble/envui/icons/History';
import { Search } from '@envsemble/envui/icons/Search';
import { Settings } from '@envsemble/envui/icons/Settings';

const tools = [
  { label: 'Show files', icon: <Folder /> },
  { label: 'Search files', icon: <Search /> },
  { label: 'Show history', icon: <History /> },
  { label: 'Open settings', icon: <Settings /> },
];

export default function RailOfIcons() {
  return (
    <Stack gap={1} align="start">
      {tools.map(({ label, icon }) => (
        // inline-end opens beside the rail, toward the content, in either text direction.
        <Tooltip key={label} content={label} side="inline-end">
          <IconButton icon={icon} aria-label={label} variant="ghost" />
        </Tooltip>
      ))}
    </Stack>
  );
}
