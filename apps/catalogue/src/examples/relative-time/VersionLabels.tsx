import { useState } from 'react';
import { Select, formatRelativeTime } from '@envsemble/envui';

const hour = 60 * 60_000;
const day = 24 * hour;

export default function VersionLabels() {
  const [now] = useState(() => Date.now());
  const versions = [
    { id: 'v3', savedAt: now - 2 * hour },
    { id: 'v2', savedAt: now - day },
    { id: 'v1', savedAt: now - 9 * day },
  ];
  // Option labels are strings, so they take the text from formatRelativeTime.
  const options = versions.map((version, index) => ({
    value: version.id,
    label: `Version ${versions.length - index} · saved ${formatRelativeTime(version.savedAt)}`,
  }));
  return <Select label="Restore a version" items={options} defaultValue="v3" />;
}
