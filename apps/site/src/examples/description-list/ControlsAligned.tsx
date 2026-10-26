import { DescriptionList, Select, Switch } from '@envsemble/envui';

const visibility = [
  { value: 'private', label: 'Only me' },
  { value: 'team', label: 'My team' },
];

export default function ControlsAligned() {
  return (
    <DescriptionList.Root controls aria-label="Sharing" style={{ inlineSize: 'min(100%, 26rem)' }}>
      <DescriptionList.Item label="Visibility">
        <Select aria-label="Visibility" size="sm" defaultValue="team" items={visibility} />
      </DescriptionList.Item>
      <DescriptionList.Item label="Comments">
        <Switch aria-label="Allow comments" defaultChecked />
      </DescriptionList.Item>
      <DescriptionList.Item label="Owner">Sam Lee</DescriptionList.Item>
    </DescriptionList.Root>
  );
}
