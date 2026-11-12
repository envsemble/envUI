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
      {actions.map(({ label, icon }, index) => (
        // The tooltip shows the name the button already has. The first is shown open in the
        // docs; without defaultOpen, each opens on hover and focus.
        <Tooltip key={label} content={label} defaultOpen={index === 0}>
          <IconButton icon={icon} aria-label={label} />
        </Tooltip>
      ))}
    </Row>
  );
}
