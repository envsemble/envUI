import { Button, IconButton, Stack, Surface, Text } from '@envsemble/envui';
import { Add } from '@envsemble/envui/icons/Add';
import { Menu } from '@envsemble/envui/icons/Menu';
import { Settings } from '@envsemble/envui/icons/Settings';

export default function QuietToolbar() {
  return (
    <Stack align="start">
      <Surface tone="pane" padding={3} style={{ inlineSize: 'min(100%, 24rem)' }}>
        {/* A toolbar row: the title takes the room the actions leave. */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <IconButton variant="quiet" icon={<Menu />} aria-label="Toggle sidebar" />
          <Text as="span" variant="section-heading" style={{ flex: '1 1 auto' }}>
            Projects
          </Text>
          <IconButton variant="quiet" icon={<Add />} aria-label="New project" />
          <IconButton variant="quiet" icon={<Settings />} aria-label="Project settings" />
        </div>
      </Surface>
      <Button variant="quiet" startIcon={<Add />}>
        New section
      </Button>
    </Stack>
  );
}
