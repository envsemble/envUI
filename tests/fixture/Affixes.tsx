import { useState } from 'react';
import { IconButton, TextField, SearchField, Theme, type ThemeValue } from '@envsemble/envui';
import { ContentCopy } from '@envsemble/envui/icons/ContentCopy';
import { Sell } from '@envsemble/envui/icons/Sell';

export function AffixesFixture({ theme }: { theme: ThemeValue }) {
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
          showLabel={false}
          label="Price"
          name="price"
          placeholder="0.00"
          prefix="€"
          suffix="per month"
          startIcon={<Sell />}
          endAction={<IconButton variant="text" icon={<ContentCopy />} aria-label="Copy price" />}
        />
        <TextField showLabel label="Share" name="share" suffix="%" defaultValue="40" />
        <TextField
          variant="underline"
          label="Handle"
          name="handle"
          prefix="@"
          defaultValue="aurora"
        />
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
    </Theme>
  );
}
