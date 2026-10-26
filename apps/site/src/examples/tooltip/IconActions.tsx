import { IconButton, Tooltip, Row } from '@envsemble/envui';
import { Download } from '@envsemble/envui/icons/Download';
import { Refresh } from '@envsemble/envui/icons/Refresh';
import { Share } from '@envsemble/envui/icons/Share';

const actions = [
  { label: 'Refresh members', icon: <Refresh /> },
  { label: 'Download as CSV', icon: <Download /> },
  { label: 'Share list', icon: <Share /> },
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
