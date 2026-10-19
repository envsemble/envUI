import { useState } from 'react';
import { Button, Slider, Theme, type ThemeValue } from '@envsemble/envui';

export function SlidersFixture({ theme }: { theme: ThemeValue }) {
  const [opacity, setOpacity] = useState(40);
  const [commits, setCommits] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState('');
  return (
    <Theme theme={theme} data-testid={`sliders-${theme}`} className="fixture-section">
      <Slider
        label="Opacity"
        description="Applies to the selected layer"
        value={opacity}
        onValueChange={setOpacity}
        onValueCommitted={(value) => setCommits((current) => [...current, value])}
        formatValue={(value) => `${value}%`}
      />
      <output data-testid={`opacity-${theme}`}>{opacity}</output>
      <output data-testid={`commits-${theme}`}>{commits.join(' ')}</output>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          setSubmitted([...data].map(([name, value]) => `${name}=${String(value)}`).join(' '));
        }}
      >
        <Slider label="Volume" name="volume" defaultValue={30} step={5} />
        <Slider label="Scale" name="scale" min={50} max={200} step={10} defaultValue={100} />
        <Slider label="Balance" name="balance" defaultValue={50} disabled />
        <div className="fixture-actions">
          <Button type="submit">Submit sliders</Button>
          <Button type="reset" variant="secondary">
            Reset sliders
          </Button>
        </div>
      </form>
      <output data-testid={`sliders-submitted-${theme}`}>{submitted}</output>
    </Theme>
  );
}
