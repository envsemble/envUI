import { IconButton, Tooltip, Row } from '@envsemble/envui';
import { IconFormatBold } from '@envsemble/envui/icons/FormatBold';
import { IconFormatItalic } from '@envsemble/envui/icons/FormatItalic';
import { IconFormatUnderlined } from '@envsemble/envui/icons/FormatUnderlined';

const formats = [
  { label: 'Bold', shortcut: 'Ctrl+B', keys: 'Control+B', icon: <IconFormatBold /> },
  { label: 'Italic', shortcut: 'Ctrl+I', keys: 'Control+I', icon: <IconFormatItalic /> },
  { label: 'Underline', shortcut: 'Ctrl+U', keys: 'Control+U', icon: <IconFormatUnderlined /> },
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
