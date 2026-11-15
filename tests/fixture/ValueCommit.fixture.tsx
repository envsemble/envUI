import { useState } from 'react';
import { SearchField, TextField, Theme } from '@envsemble/envui';

export const mount = 'standalone';

export default function ValueCommitFixture() {
  const [commits, setCommits] = useState<string[]>([]);
  const record = (name: string) => (value: string) =>
    setCommits((current) => [...current, `${name}=${value}`]);
  return (
    <Theme theme="light" className="fixture-section">
      <TextField label="Port" defaultValue="7420" onValueCommitted={record('port')} />
      <SearchField label="Search members" onValueCommitted={record('search')} />
      <output data-testid="commits">{commits.join(' ')}</output>
    </Theme>
  );
}
