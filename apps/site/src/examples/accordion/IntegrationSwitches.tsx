import { useState } from 'react';
import { Accordion, Switch } from '@envsemble/envui';

const integrations = [
  { id: 'slack', name: 'Slack', detail: 'Posts a message to #launch when a work item is done.' },
  { id: 'github', name: 'GitHub', detail: 'Links pull requests to the work items they close.' },
];

export default function IntegrationSwitches() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>({ slack: true, github: false });
  return (
    <Accordion.Root style={{ inlineSize: 'min(100%, 32rem)' }}>
      {integrations.map((integration) => (
        <Accordion.Item
          key={integration.id}
          value={integration.id}
          title={integration.name}
          end={
            <Switch
              aria-label={`${integration.name} on`}
              checked={enabled[integration.id]}
              onCheckedChange={(checked) =>
                setEnabled((current) => ({ ...current, [integration.id]: checked }))
              }
            />
          }
        >
          {integration.detail}
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
