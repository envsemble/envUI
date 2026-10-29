import { IconButton, Column, Tooltip } from '@envsemble/envui';
import { IconFolder } from '@envsemble/envui/icons/Folder';
import { IconHistory } from '@envsemble/envui/icons/History';
import { IconSearch } from '@envsemble/envui/icons/Search';
import { IconSettings } from '@envsemble/envui/icons/Settings';

const tools = [
  { label: 'Show files', icon: <IconFolder /> },
  { label: 'Search files', icon: <IconSearch /> },
  { label: 'Show history', icon: <IconHistory /> },
  { label: 'Open settings', icon: <IconSettings /> },
];

export default function RailOfIcons() {
  // Shown open in the docs on Search files; without defaultOpen, it opens on hover and focus.
  return (
    <Column gap={1} align="start">
      {tools.map(({ label, icon }) => (
        // inline-end opens beside the rail, toward the content, in either text direction.
        <Tooltip
          key={label}
          content={label}
          side="inline-end"
          defaultOpen={label === 'Search files'}
        >
          <IconButton icon={icon} aria-label={label} variant="ghost" />
        </Tooltip>
      ))}
    </Column>
  );
}
