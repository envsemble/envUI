import { Button, IconButton, Column, Surface, Text } from '@envsemble/envui';
import { Add } from '@envsemble/envui/icons/Add';
import { Menu } from '@envsemble/envui/icons/Menu';
import { Settings } from '@envsemble/envui/icons/Settings';

export default function QuietToolbar() {
  return (
    <Column gap={4} align="start">
      <Surface background="default" padding={3} style={{ inlineSize: 'min(100%, 24rem)' }}>
        {/* A toolbar row: the title takes the room the actions leave. */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <IconButton variant="ghost" icon={<Menu />} aria-label="Toggle sidebar" />
          <Text render={<span />} variant="title" style={{ flex: '1 1 auto' }}>
            Projects
          </Text>
          <IconButton variant="ghost" icon={<Add />} aria-label="New project" />
          <IconButton variant="ghost" icon={<Settings />} aria-label="Project settings" />
        </div>
      </Surface>
      <Button variant="ghost" startIcon={<Add />}>
        New section
      </Button>
    </Column>
  );
}
