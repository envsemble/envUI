import { DiffStat, Stack, Text } from '@envsemble/envui';
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

/** The title with the size of the change beside it. */
const heading = { display: 'flex', alignItems: 'center', gap: '0.5rem' } as const;

export default function SettingsDiff() {
  const { additions, deletions } = countDiffLines(saved, draft, 'settings.json');
  return (
    <Stack gap={3}>
      <div style={heading}>
        <Text as="h3" variant="section-heading">
          Unsaved changes
        </Text>
        <DiffStat additions={additions} deletions={deletions} />
      </div>
      <CodeDiff filename="settings.json" before={saved} after={draft} />
    </Stack>
  );
}
