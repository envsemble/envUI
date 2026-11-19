import { Column, Text } from '@envsemble/envui';
import { CodeDiff } from '@envsemble/envui/diff';

const saved = `{
  "theme": "light",
  "density": "standard",
  "notifications": true
}
`;
const draft = `{
  "theme": "system",
  "density": "compact",
  "notifications": true,
  "language": "en"
}
`;

export default function SettingsDiff() {
  return (
    <Column gap={3} style={{ inlineSize: '100%' }}>
      <Text render={<h3 />} variant="title">
        Unsaved changes
      </Text>
      <CodeDiff filename="settings.json" before={saved} after={draft} />
    </Column>
  );
}
