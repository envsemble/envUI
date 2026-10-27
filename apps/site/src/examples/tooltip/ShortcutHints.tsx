import { IconButton, Tooltip, Row } from '@envsemble/envui';
import { FormatBold } from '@envsemble/envui/icons/FormatBold';
import { FormatItalic } from '@envsemble/envui/icons/FormatItalic';
import { FormatUnderlined } from '@envsemble/envui/icons/FormatUnderlined';

const formats = [
  { label: 'Bold', shortcut: 'Ctrl+B', keys: 'Control+B', icon: <FormatBold /> },
  { label: 'Italic', shortcut: 'Ctrl+I', keys: 'Control+I', icon: <FormatItalic /> },
  { label: 'Underline', shortcut: 'Ctrl+U', keys: 'Control+U', icon: <FormatUnderlined /> },
];

export default function ShortcutHints() {
  // Shown open in the docs on Bold; without defaultOpen, each opens on hover and focus.
  return (
    <Row wrap align="center" gap={4}>
      {formats.map(({ label, shortcut, keys, icon }) => (
        <Tooltip
          key={label}
          content={`${label} (${shortcut})`}
          side="bottom"
          defaultOpen={label === 'Bold'}
        >
          {/* aria-keyshortcuts tells assistive technology what the tooltip shows. */}
          <IconButton icon={icon} aria-label={label} aria-keyshortcuts={keys} variant="ghost" />
        </Tooltip>
      ))}
    </Row>
  );
}
