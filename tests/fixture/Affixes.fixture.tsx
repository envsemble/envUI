import { useState } from 'react';
import { IconButton, TextField, SearchField, Theme, type ColorScheme } from '@envsemble/envui';
import { IconContentCopy } from '@envsemble/envui/icons/ContentCopy';
import { IconSell } from '@envsemble/envui/icons/Sell';

export function AffixesFixture({ theme }: { theme: ColorScheme }) {
  const [submitted, setSubmitted] = useState('');
  return (
    <Theme theme={theme} data-testid={`affixes-${theme}`} className="fixture-section">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          setSubmitted([...data].map(([name, value]) => `${name}=${String(value)}`).join(' '));
        }}
      >
        <TextField label="Address" name="slug" prefix="https://example.com/" />
        <TextField
          label="Size"
          name="size"
          type="number"
          suffix="MB"
          defaultValue="2"
          description="Up to 10"
        />
        <TextField
          visibleLabel={false}
          label="Price"
          name="price"
          placeholder="0.00"
          prefix="€"
          suffix="per month"
          startIcon={<IconSell />}
          endAction={
            <IconButton variant="text" icon={<IconContentCopy />} aria-label="Copy price" />
          }
        />
        <TextField visibleLabel label="Share" name="share" suffix="%" defaultValue="40" />
        <TextField size="lg" label="Handle" name="handle" prefix="@" defaultValue="aurora" />
        <SearchField variant="ghost" label="Find projects" placeholder="Find projects" />
        <TextField label="Quota" name="quota" suffix="GB" defaultValue="12" disabled />
        <TextField
          label="Limit"
          name="limit"
          suffix="items"
          defaultValue="0"
          error="Use 1 or more."
        />
        <div className="fixture-narrow-field">
          <TextField
            label="Link"
            name="link"
            prefix="https://workspace.example.com/projects/design-system/"
            defaultValue="tokens"
          />
        </div>
        <button type="submit">Submit affixes</button>
      </form>
      <output data-testid={`affixes-submitted-${theme}`}>{submitted}</output>
      {/* Right to left, with and without a start icon: the notch follows the floated label. */}
      <div dir="rtl">
        <TextField label="Street" name="street" />
        <TextField label="City" name="city" startIcon={<IconSell />} />
      </div>
    </Theme>
  );
}
