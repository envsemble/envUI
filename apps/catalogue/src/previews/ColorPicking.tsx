import { useState } from 'react';
import { ActionGroup, Button, ColorPicker, Stack, Text, Kbd } from '@envsemble/envui';
import { Example, Specimen, SpecimenGrid } from './Example';
import { Preview } from './Preview';

export function ColorPickerPreview() {
  const [color, setColor] = useState('#1a73e8');
  const [submittedColor, setSubmittedColor] = useState('');
  return (
    <Preview>
      <Example
        title="Color selection"
        size="collection"
        caption={
          <>
            Use <Kbd>←</Kbd> <Kbd>↑</Kbd> <Kbd>→</Kbd> <Kbd>↓</Kbd> in the color area or hue slider,
            or enter a six-digit HEX color.
          </>
        }
      >
        <SpecimenGrid>
          <Specimen title="Interactive">
            <ColorPicker label="Accent color" value={color} onValueChange={setColor} />
          </Specimen>
          <Specimen title="Read only">
            <ColorPicker label="Workspace color" value="#34a853" readOnly />
          </Specimen>
          <Specimen title="Disabled">
            <ColorPicker label="Unavailable color" defaultValue="#ea4335" disabled />
          </Specimen>
        </SpecimenGrid>
      </Example>
      <Example
        title="Native form"
        size="field"
        caption="Reset restores the initial color of an uncontrolled picker."
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setSubmittedColor(String(new FormData(event.currentTarget).get('accent')));
          }}
        >
          <Stack>
            <ColorPicker label="Project color" name="accent" defaultValue="#6750a4" />
            <ActionGroup>
              <Button type="submit">Apply color</Button>
              <Button type="reset" variant="secondary">
                Reset color
              </Button>
            </ActionGroup>
            <Text variant="caption" role="status">
              {submittedColor && `Applied color: ${submittedColor}`}
            </Text>
          </Stack>
        </form>
      </Example>
    </Preview>
  );
}
