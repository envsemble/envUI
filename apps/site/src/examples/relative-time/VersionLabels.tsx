import { useState } from 'react';
import { Select, formatRelativeTime } from '@envsemble/envui';

const hourMs = 60 * 60_000;
const dayMs = 24 * hourMs;

export default function VersionLabels() {
  const [now] = useState(() => Date.now());
  const versions = [
    { id: 'v3', savedAt: now - 2 * hourMs },
    { id: 'v2', savedAt: now - dayMs },
    { id: 'v1', savedAt: now - 9 * dayMs },
  ];
  const options = versions.map((version, index) => ({
    value: version.id,
    label: `Version ${versions.length - index} · saved ${formatRelativeTime(version.savedAt)}`,
  }));
  return <Select label="Restore a version" items={options} defaultValue="v3" />;
}
