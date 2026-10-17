import { useState } from 'react';
import {
  Radio,
  RadioGroup,
  Stack,
  Text,
  useThemePreference,
  type ThemePreference,
} from '@envsemble/envui';

const preferences: readonly ThemePreference[] = ['system', 'light', 'dark'];
const scales = ['comfortable', 'compact'] as const;
type Scale = (typeof scales)[number];

export default function AppearanceChoice() {
  // The application's ThemePreferenceProvider stores the theme and applies it to the whole page;
  // a choice here takes effect at once, with no Save button.
  const { preference, setPreference } = useThemePreference();
  // The scale is stored by the application too, and set once, on the root provider's `scale`:
  // one scale for the whole app, never a scale per page or per section.
  const [scale, setScale] = useState<Scale>('comfortable');
  return (
    // envUI has no form column yet: the choices keep to a width that reads easily.
    <Stack gap={6} style={{ maxInlineSize: '32rem' }}>
      <RadioGroup
        label="Theme"
        name="theme"
        orientation="vertical"
        value={preference}
        onValueChange={(value) => {
          const next = preferences.find((item) => item === value);
          if (next) setPreference(next);
        }}
      >
        <Radio value="system" label="System" description="Follows your device’s setting." />
        <Radio value="light" label="Light" />
        <Radio value="dark" label="Dark" />
      </RadioGroup>
      <Stack gap={3}>
        <RadioGroup
          label="Density"
          name="scale"
          orientation="vertical"
          value={scale}
          onValueChange={(value) => {
            const next = scales.find((item) => item === value);
            if (next) setScale(next);
          }}
        >
          <Radio
            value="comfortable"
            label="Comfortable"
            description="Roomier controls and text, for most screens."
          />
          <Radio
            value="compact"
            label="Compact"
            description="Smaller controls and text, to see more at once."
          />
        </RadioGroup>
        <Text variant="body-sm" emphasis="muted">
          Applies to every page of Northwind on this device.
        </Text>
      </Stack>
    </Stack>
  );
}
