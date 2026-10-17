import {
  Badge,
  CounterBadge,
  NavList,
  Stack,
  Surface,
  Theme,
  type BadgeTone,
  type ThemeValue,
} from '@envsemble/envui';
import { Inbox } from '@envsemble/envui/icons/Inbox';

const tones: BadgeTone[] = ['neutral', 'accent', 'success', 'warning', 'danger', 'done'];

export function BadgesFixture({ theme }: { theme: ThemeValue }) {
  return (
    <Theme theme={theme} data-testid={`badges-${theme}`} className="fixture-section">
      {(['canvas', 'pane', 'row'] as const).map((surface) => (
        <Surface
          key={surface}
          background={surface === 'canvas' ? 'page' : surface === 'row' ? 'muted' : 'default'}
          padding={4}
          data-surface={surface}
        >
          <Stack gap={2}>
            {(['soft', 'solid', 'outline'] as const).map((variant) => (
              <div key={variant} className="fixture-actions">
                {tones.map((tone) => (
                  <Badge key={tone} tone={tone} variant={variant} data-testid="badge">
                    {tone} {variant}
                  </Badge>
                ))}
              </div>
            ))}
            <div className="fixture-actions">
              {tones.map((tone) => (
                <span
                  key={tone}
                  data-testid="tone-text"
                  style={{ color: `var(--env-color-fg-${tone === 'neutral' ? 'muted' : tone})` }}
                >
                  {tone}
                </span>
              ))}
            </div>
          </Stack>
        </Surface>
      ))}
      <NavList.Item
        icon={<Inbox />}
        trailing={<CounterBadge value={12} aria-label="12 unread" tone="accent" />}
      >
        Inbox
      </NavList.Item>
      <NavList.Item
        icon={<Inbox />}
        iconOnly
        aria-label="Inbox with unread"
        trailing={<CounterBadge value={12} />}
      >
        Inbox
      </NavList.Item>
    </Theme>
  );
}
