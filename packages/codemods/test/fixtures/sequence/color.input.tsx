// A color picker written for 1.0.0-prerelease.1, run through every transform in order: its props
// move while it is imported from @envsemble/envui, then its import moves to @envsemble/envui/color.
import { Button, ColorPicker, ColorSwatch, Popover } from '@envsemble/envui';

export function LabelColor({ color, onChange }: { color: string; onChange: (v: string) => void }) {
  return (
    <Popover
      aria-label="Label color"
      trigger={
        <Button variant="secondary" startIcon={<ColorSwatch color={color} />}>
          {color}
        </Button>
      }
    >
      <ColorPicker
        label="Label color"
        hint="Shown beside the label."
        variant="outline"
        value={color}
        onValueChange={onChange}
      />
    </Popover>
  );
}
