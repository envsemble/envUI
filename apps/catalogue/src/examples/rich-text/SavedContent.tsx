import { useState } from 'react';
import { Column, Text } from '@envsemble/envui';
import { RichText } from '@envsemble/envui/rich-text';

// Saved Markdown, as RichTextEditor writes it: a reference keeps its ID, label and destination.
const saved = `[reference id="person%3Apriya" label="Priya%20Shah" kind="person" href="%2Fpeople%2Fpriya" mentionSuggestionChar="%40"] owns the press kit; the dates are in the [launch plan](/docs/launch-plan).

- [x] Pricing page frozen
- [ ] Press kit sent`;

export default function SavedContent() {
  const [opened, setOpened] = useState('');
  return (
    <Column gap={3}>
      <RichText
        onReferenceClick={(reference, event) => {
          // The application resolves the ID and opens the record itself.
          event.preventDefault();
          setOpened(`Opened ${reference.label}`);
        }}
        onLinkClick={(href, event) => {
          event.preventDefault();
          setOpened(`Opened ${href}`);
        }}
      >
        {saved}
      </RichText>
      <Text variant="body-sm" role="status">
        {opened}
      </Text>
    </Column>
  );
}
