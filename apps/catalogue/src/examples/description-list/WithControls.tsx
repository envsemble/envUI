import { useState } from 'react';
import { DescriptionList, Select, Switch } from '@envsemble/envui';

export default function WithControls() {
  const [visibility, setVisibility] = useState<string | null>('team');
  return (
    <DescriptionList.Root controls aria-label="Sharing">
      <DescriptionList.Item label="Visibility">
        <Select
          aria-label="Visibility"
          size="sm"
          value={visibility}
          onValueChange={setVisibility}
          items={[
            { value: 'private', label: 'Only me' },
            { value: 'team', label: 'My team' },
            { value: 'public', label: 'Anyone with the link' },
          ]}
        />
      </DescriptionList.Item>
      <DescriptionList.Item label="Comments">
        <Switch aria-label="Allow comments" defaultChecked />
      </DescriptionList.Item>
      <DescriptionList.Item label="Owner">Sam Lee</DescriptionList.Item>
    </DescriptionList.Root>
  );
}
