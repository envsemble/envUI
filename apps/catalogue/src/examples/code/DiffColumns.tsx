import { CodeDiff } from '@envsemble/envui/diff';

const saved = `{
  "theme": "light",
  "density": "standard"
}
`;
const draft = `{
  "theme": "system",
  "density": "compact"
}
`;

export default function DiffColumns() {
  return <CodeDiff filename="settings.json" before={saved} after={draft} />;
}
