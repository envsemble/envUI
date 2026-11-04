import { IconButton, Tooltip, Row } from '@envsemble/envui';
import { IconDownload } from '@envsemble/envui/icons/Download';
import { IconRefresh } from '@envsemble/envui/icons/Refresh';
import { IconShare } from '@envsemble/envui/icons/Share';

const actions = [
  { label: 'Refresh members', icon: <IconRefresh /> },
  { label: 'Download as CSV', icon: <IconDownload /> },
  { label: 'Share list', icon: <IconShare /> },
];

export default function IconActions() {
  return (
    <Row wrap align="center" gap={4}>
      {actions.map(({ label, icon }) => (
        // The tooltip shows the name the button already has.
        <Tooltip key={label} content={label}>
          <IconButton icon={icon} aria-label={label} />
        </Tooltip>
      ))}
    </Row>
  );
}
