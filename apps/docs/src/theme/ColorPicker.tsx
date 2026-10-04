import { useEffect, useState } from 'react';
import { Input, Stack } from '@envsemble/envui';
import { HexColorPicker } from 'react-colorful';

/** Documentation-only picker with the same HEX entry in every browser. */
export function ColorPicker({
  color,
  onChange,
}: {
  color: string;
  onChange: (color: string) => void;
}) {
  const [draft, setDraft] = useState(color);
  useEffect(() => setDraft(color), [color]);
  const valid = /^#?[0-9a-f]{6}$/i.test(draft);

  return (
    <Stack gap={4}>
      <HexColorPicker className="docs-palette-picker" color={color} onChange={onChange} />
      <Input
        label="HEX"
        value={draft}
        maxLength={7}
        autoComplete="off"
        spellCheck={false}
        aria-invalid={!valid}
        onChange={(event) => {
          const next = event.currentTarget.value;
          setDraft(next);
          if (/^#?[0-9a-f]{6}$/i.test(next)) onChange(`#${next.replace(/^#/, '').toLowerCase()}`);
        }}
        onBlur={() => {
          if (!valid) setDraft(color);
        }}
      />
    </Stack>
  );
}
