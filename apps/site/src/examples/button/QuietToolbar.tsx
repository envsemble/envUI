import { Button, IconButton, Column, Surface, Text } from '@envsemble/envui';
import { IconAdd } from '@envsemble/envui/icons/Add';
import { IconMenu } from '@envsemble/envui/icons/Menu';
import { IconSettings } from '@envsemble/envui/icons/Settings';

export default function QuietToolbar() {
  return (
    <Column gap={4} align="start">
      <Surface background="default" padding={3} style={{ inlineSize: 'min(100%, 24rem)' }}>
        {/* A toolbar row: the title takes the room the actions leave. */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <IconButton variant="ghost" icon={<IconMenu />} aria-label="Toggle sidebar" />
          <Text render={<span />} variant="title" style={{ flex: '1 1 auto' }}>
            Projects
          </Text>
          <IconButton variant="ghost" icon={<IconAdd />} aria-label="New project" />
          <IconButton variant="ghost" icon={<IconSettings />} aria-label="Project settings" />
        </div>
      </Surface>
      <Button variant="ghost" startIcon={<IconAdd />}>
        New section
      </Button>
    </Column>
  );
}
