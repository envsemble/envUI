import { Badge, Button, Surface, Tabs, Theme, type ColorScheme } from '@envsemble/envui';

export const themes = true;

/** Compact tabs with a counter in a compact bar. */
export default function TabsCompactFixture({ theme }: { theme: ColorScheme }) {
  return (
    <Theme theme={theme} data-testid={`compact-tabs-${theme}`} className="fixture-section">
      <Surface
        background="page"
        padding={0}
        className="fixture-actions"
        style={{ alignItems: 'center' }}
      >
        <Button size="sm" data-testid={`compact-control-${theme}`}>
          Compact control
        </Button>
        <Tabs
          size="sm"
          aria-label={`Form sections ${theme}`}
          items={[
            {
              value: 'submissions',
              button: (
                <Button variant="secondary">
                  Submissions <Badge count={24} />
                </Button>
              ),
              content: null,
            },
            { value: 'editor', button: <Button variant="secondary">Editor</Button>, content: null },
          ]}
        />
      </Surface>
    </Theme>
  );
}
