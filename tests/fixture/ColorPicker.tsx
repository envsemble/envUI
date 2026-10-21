import { useState } from 'react';
import {
  Button,
  Checkbox,
  ColorPicker,
  Column,
  Row,
  Theme,
  type ThemeValue,
} from '@envsemble/envui';

export function ColorPickerFixture({ theme }: { theme: ThemeValue }) {
  const [color, setColor] = useState('#1a73e8');
  const [changes, setChanges] = useState(0);
  const [disabled, setDisabled] = useState(false);
  const [preventReset, setPreventReset] = useState(false);
  const [policy, setPolicy] = useState<'accept' | 'reject' | 'clamp'>('accept');
  const [values, setValues] = useState<Record<string, string>>({});
  const formId = `${theme}-color-form`;
  return (
    <Theme theme={theme} data-testid={`color-picker-${theme}`}>
      <Column gap={4} render={<section />} className="fixture-section">
        <form
          id={formId}
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
          <Column gap={4}>
            <ColorPicker
              label="Controlled color"
              name="controlledColor"
              value={color}
              disabled={disabled}
              onValueChange={(next) => {
                if (policy === 'accept') setColor(next);
                if (policy === 'clamp') setColor('#1a73e8');
                setChanges((count) => count + 1);
              }}
            />
            <ColorPicker
              label="Uncontrolled color"
              name="uncontrolledColor"
              defaultValue="#34a853"
            />
            <ColorPicker
              label="Disabled color"
              name="disabledColor"
              defaultValue="#ea4335"
              disabled
            />
            <ColorPicker label="Read only color" name="readOnlyColor" value="#6750a4" readOnly />
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
              <Button variant="text" onClick={() => setPolicy('accept')}>
                Accept color changes
              </Button>
            </Row>
          </Column>
        </form>
        <ColorPicker
          label="External color"
          name="externalColor"
          defaultValue="#112233"
          form={formId}
        />
        <output data-testid="color-changes">{changes}</output>
        <output data-testid="color-values">{JSON.stringify(values)}</output>
      </Column>
    </Theme>
  );
}
