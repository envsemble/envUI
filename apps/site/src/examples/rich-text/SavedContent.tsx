import { useState } from 'react';
import { Column, Text } from '@envsemble/envui';
import { RichText } from '@envsemble/envui/rich-text';

const savedMarkdown = `
[reference id="person%3Apriya" label="Priya%20Shah" kind="person" mentionSuggestionChar="%40"]
owns the press kit; the dates are in the [launch plan](/docs/launch-plan).

- [x] Pricing page frozen
- [ ] Press kit sent`;

export default function SavedContent() {
  const [opened, setOpened] = useState('');
  return (
    <Column gap={3}>
      <RichText
        onReferenceClick={(reference, event) => {
          event.preventDefault();
          setOpened(`Opened ${reference.label}`);
        }}
        onLinkClick={(href, event) => {
          event.preventDefault();
          setOpened(`Opened ${href}`);
        }}
      >
        {savedMarkdown}
      </RichText>
      <Text variant="body-sm" role="status">
        {opened}
      </Text>
    </Column>
  );
}
