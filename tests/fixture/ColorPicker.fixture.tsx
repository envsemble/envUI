import { useState } from 'react';
import { Button, Checkbox, Column, Row, Theme } from '@envsemble/envui';
import { ColorPicker, ColorPickerButton, ColorSwatch } from '@envsemble/envui/color';

export default function ColorPickerFixture() {
  const [color, setColor] = useState('#1a73e8');
  const [changes, setChanges] = useState(0);
  const [last, setLast] = useState('');
  const [translucent, setTranslucent] = useState('');
  const [every, setEvery] = useState('');
  const [disabled, setDisabled] = useState(false);
  const [preventReset, setPreventReset] = useState(false);
  const [policy, setPolicy] = useState<'accept' | 'reject' | 'clamp'>('accept');
  const [values, setValues] = useState<Record<string, string>>({});
  return (
    <Theme theme="light" data-testid="color-picker">
      <Column gap={4} render={<section />} className="fixture-section">
        <form
          id="color-form"
          data-testid="color-form"
          onReset={(event) => {
            if (preventReset) event.preventDefault();
          }}
          onSubmit={(event) => {
            event.preventDefault();
            setValues(
              Object.fromEntries(
                [...new FormData(event.currentTarget)].map(([name, value]) => [
                  name,
                  String(value),
                ]),
              ),
            );
          }}
        >
          <Column gap={4} style={{ inlineSize: '20rem' }}>
            <ColorPicker
              label="Controlled color"
              name="controlledColor"
              value={color}
              disabled={disabled}
              onValueChange={(next) => {
                if (policy === 'accept') setColor(next);
                if (policy === 'clamp') setColor('#1a73e8');
                setLast(next);
                setChanges((count) => count + 1);
              }}
            />
            <ColorPicker
              label="Uncontrolled color"
              name="uncontrolledColor"
              defaultValue="#34a853"
              formats={['hex']}
              eyeDropper={false}
            />
            <ColorPicker
              label="Translucent color"
              name="translucentColor"
              defaultValue="#6750a480"
              alpha
              valueFormat="rgb"
              swatches={['#ff0000', { color: '#00800080', label: 'Half green' }, '#0000ff']}
              onValueChange={setTranslucent}
            />
            <ColorPicker
              label="Every format"
              defaultValue="#336699"
              formats={['hex', 'rgb', 'hsl']}
              alpha
              onValueChange={setEvery}
            />
            <ColorPicker
              label="Disabled color"
              name="disabledColor"
              defaultValue="#ea4335"
              disabled
            />
            <ColorPicker label="Read only color" name="readOnlyColor" value="#6750a4" readOnly />
            <ColorPickerButton label="Button color" name="buttonColor" defaultValue="#2f6f62" />
            <Checkbox
              label="Disable color editing"
              checked={disabled}
              onCheckedChange={setDisabled}
            />
            <Checkbox
              label="Prevent color reset"
              checked={preventReset}
              onCheckedChange={setPreventReset}
            />
            <Row wrap align="center" gap={4}>
              <Button type="submit">Submit colors</Button>
              <Button type="reset" variant="secondary">
                Reset colors
              </Button>
              <Button variant="outline" onClick={() => setColor('#ff0000')}>
                Replace selected color
              </Button>
              <Button variant="text" onClick={() => setPolicy('reject')}>
                Reject color changes
              </Button>
              <Button variant="text" onClick={() => setPolicy('clamp')}>
                Clamp color changes
              </Button>
            </Row>
          </Column>
        </form>
        <ColorPicker
          label="External color"
          name="externalColor"
          defaultValue="#112233"
          formats={['hex']}
          form="color-form"
          style={{ inlineSize: '20rem' }}
        />
        <Row gap={4} align="center" data-testid="color-swatches">
          <ColorSwatch color="#6750a4" format="rgb" label="Violet" />
          <ColorSwatch color="#ffffff" />
          <Button variant="secondary" startIcon={<ColorSwatch color="#ffffff" />}>
            #FFFFFF
          </Button>
        </Row>
        <output data-testid="color-changes">{changes}</output>
        <output data-testid="color-last">{last}</output>
        <output data-testid="color-translucent">{translucent}</output>
        <output data-testid="color-every">{every}</output>
        <output data-testid="color-values">{JSON.stringify(values)}</output>
      </Column>
    </Theme>
  );
}
