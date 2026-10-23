import { Column, DiffStat, Row, Text } from '@envsemble/envui';
import { CodeDiff, countDiffLines } from '@envsemble/envui/diff';

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
  const { additions, deletions } = countDiffLines(saved, draft, 'settings.json');
  return (
    <Column gap={3} style={{ inlineSize: '100%' }}>
      <Row align="center" gap={2}>
        <Text render={<h3 />} variant="title">
          Unsaved changes
        </Text>
        <DiffStat additions={additions} deletions={deletions} />
      </Row>
      <CodeDiff filename="settings.json" before={saved} after={draft} />
    </Column>
  );
}
