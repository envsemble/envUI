import { useRef, useState } from 'react';
import { Checkbox, Radio, RadioGroup, Column, Switch } from '@envsemble/envui';

export const mount = 'standalone';

/**
 * Checkbox, Switch and Radio with a class, a style and a ref each, for
 * tests/browser/library/Checkbox.spec.ts, Switch.spec.ts and Radio.spec.ts: the class and the style reach
 * the root, the label around the control; the ref and the other native props reach the input. A
 * checkbox without a visible label shows its hit area.
 */
export default function ChoiceControlsFixture() {
  const checkbox = useRef<HTMLInputElement>(null);
  const toggle = useRef<HTMLInputElement>(null);
  const radio = useRef<HTMLInputElement>(null);
  const [refs, setRefs] = useState('');
  return (
    <Column gap={4} data-testid="choice-controls">
      <Checkbox
        ref={checkbox}
        label="Subscribe"
        className="app-checkbox"
        style={{ marginInlineStart: '3px' }}
        name="subscribe"
        data-testid="checkbox-input"
      />
      {/* A checkbox without a visible label, as in a table's selection column, apart from the
          rest, so its hit area reaches past the box. */}
      <div style={{ display: 'flex', paddingInline: '40px' }}>
        <Checkbox aria-label="Select row" />
      </div>
      <Switch
        ref={toggle}
        label="Alerts"
        className="app-switch"
        style={{ marginInlineStart: '3px' }}
        name="alerts"
        data-testid="switch-input"
      />
      <RadioGroup label="Plan" defaultValue="team">
        <Radio
          ref={radio}
          value="team"
          label="Team"
          className="app-radio"
          style={{ marginInlineStart: '3px' }}
          data-testid="radio-input"
        />
        <Radio value="solo" label="Solo" />
      </RadioGroup>
      <RadioGroup label="Role" orientation="vertical" defaultValue="viewer">
        <Radio value="viewer" label="Viewer" description="Reads and comments" />
        <Radio value="editor" label="Editor" description="Changes everything" />
      </RadioGroup>
      <button
        type="button"
        onClick={() =>
          setRefs(
            [checkbox, toggle, radio]
              .map((ref) => `${ref.current?.tagName}:${ref.current?.type}`)
              .join(' '),
          )
        }
      >
        Read refs
      </button>
      <output data-testid="choice-refs">{refs}</output>
    </Column>
  );
}
