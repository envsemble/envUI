import {
  Theme,
  Button,
  IconButton,
  NavList,
  Stack,
  Surface,
  Card,
  List,
  Tabs,
  Link,
  Pager,
  TextField,
  Select,
  RadioGroup,
  Radio,
  Checkbox,
  Switch,
  Badge,
  Skeleton,
  type ThemeValue,
} from '@envsemble/envui';
import { ChevronRight } from '@envsemble/envui/icons/ChevronRight';
import { Home } from '@envsemble/envui/icons/Home';
import { planOptions } from './SelectOptions.js';

/** The 1.0 emphasis of each 0.7 variant, which the samples are still named by. */
const emphasis = {
  primary: { variant: 'primary' },
  secondary: { variant: 'secondary' },
  outlined: { variant: 'outline' },
  destructive: { variant: 'primary', tone: 'danger' },
  important: { variant: 'primary', tone: 'accent' },
  text: { variant: 'text' },
} as const;

export function ColorControls({ theme }: { theme: ThemeValue }) {
  const variants: readonly (keyof typeof emphasis)[] = [
    'primary',
    'secondary',
    'outlined',
    'destructive',
    'important',
  ];
  return (
    <Theme theme={theme} data-testid={`color-controls-${theme}`} className="fixture-section">
      <h2>{theme} interactive colors</h2>
      {variants.map((variant) => (
        <Button key={variant} {...emphasis[variant]} data-testid={`${theme}-button-${variant}`}>
          {theme} {variant}
        </Button>
      ))}
      <IconButton
        icon={<ChevronRight />}
        aria-label={`${theme} chevron`}
        data-testid={`${theme}-icon-button`}
      />
      <NavList.Item icon={<Home />} data-testid={`${theme}-navigation`}>
        {theme} navigation
      </NavList.Item>
      <NavList.Item selected data-testid={`${theme}-navigation-selected`}>
        {theme} selected navigation
      </NavList.Item>
      <Stack gap={3}>
        <Surface background="muted" data-testid={`${theme}-color-surface`}>
          Surface
        </Surface>
        <Surface data-testid={`${theme}-color-pane`}>Pane</Surface>
        <Card data-testid={`${theme}-color-card`}>Card</Card>
        <Card background="default" data-testid={`${theme}-color-pane-card`}>
          Pane card
        </Card>
        <Card background="page" data-testid={`${theme}-color-canvas-card`}>
          Canvas card
        </Card>
        <List.Root>
          <List.Item label="Row" data-testid={`${theme}-color-row`} />
        </List.Root>
        <Surface background="muted" padding={3}>
          <List.Root data-testid={`${theme}-color-contrast-rows`}>
            <List.Item label="Contrast row" />
          </List.Root>
        </Surface>
        <Tabs
          aria-label={`${theme} color isolation tabs`}
          data-testid={`${theme}-color-tabs`}
          items={[
            {
              value: 'primary',
              button: <Button data-testid={`${theme}-tab-primary`}>First tab</Button>,
              content: 'First panel',
            },
            {
              value: 'secondary',
              button: (
                <Button variant="secondary" data-testid={`${theme}-tab-secondary`}>
                  Second tab
                </Button>
              ),
              content: 'Second panel',
            },
            {
              value: 'navigation',
              button: (
                <NavList.Item icon={<Home />} data-testid={`${theme}-tab-navigation`}>
                  Third tab
                </NavList.Item>
              ),
              content: 'Third panel',
            },
            {
              value: 'unavailable',
              button: <Button data-testid={`${theme}-tab-disabled`}>Unavailable tab</Button>,
              content: 'Unavailable panel',
              disabled: true,
            },
          ]}
        />
        <Link href="#" data-testid={`${theme}-color-link`}>
          Inline link
        </Link>
        <Button variant="text" data-testid={`${theme}-color-text-button`}>
          Text button
        </Button>
        <Pager.Next href="#" data-testid={`${theme}-color-direction`}>
          Next page
        </Pager.Next>
        <TextField label={`${theme} isolated field`} data-testid={`${theme}-color-field`} />
        <TextField
          label={`${theme} isolated error`}
          error="Validation error"
          data-testid={`${theme}-color-error-field`}
        />
        <Select
          label={`${theme} isolated select`}
          description="Select hint"
          items={planOptions}
          defaultValue="starter"
          data-testid={`${theme}-color-select`}
        />
        <Select
          label={`${theme} isolated select error`}
          error="Select validation error"
          items={planOptions}
          defaultValue="starter"
          data-testid={`${theme}-color-select-error`}
        />
        <RadioGroup orientation="vertical" data-testid={`${theme}-color-radio-row`}>
          <Radio
            value="sample"
            label={`${theme} isolated radio`}
            data-testid={`${theme}-color-radio`}
          />
        </RadioGroup>
        <Checkbox
          label={`${theme} isolated checkbox`}
          defaultChecked
          data-testid={`${theme}-color-checkbox`}
        />
        <Switch
          label={`${theme} isolated switch`}
          defaultChecked
          data-testid={`${theme}-color-switch`}
        />
        <Badge data-testid={`${theme}-color-chip`}>Info</Badge>
        <Skeleton data-testid={`${theme}-color-skeleton`} />
      </Stack>
    </Theme>
  );
}
