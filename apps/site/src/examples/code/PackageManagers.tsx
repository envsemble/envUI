import { useState } from 'react';
import { CodeBlock, SegmentedControl } from '@envsemble/envui';

const commands = {
  npm: 'npm install @envsemble/envui',
  pnpm: 'pnpm add @envsemble/envui',
  yarn: 'yarn add @envsemble/envui',
};

type Manager = keyof typeof commands;

export default function PackageManagers() {
  const [manager, setManager] = useState<Manager>('npm');
  return (
    <CodeBlock
      label="Install"
      copyable
      headerEnd={
        <SegmentedControl
          aria-label="Package manager"
          size="sm"
          value={manager}
          onValueChange={(next) => setManager(next as Manager)}
          items={[
            { value: 'npm', label: 'npm' },
            { value: 'pnpm', label: 'pnpm' },
            { value: 'yarn', label: 'yarn' },
          ]}
        />
      }
    >
      {commands[manager]}
    </CodeBlock>
  );
}
