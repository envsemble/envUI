import {
  Theme,
  Button,
  IconButton,
  NavigationDrawer,
  Column,
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
  type ColorScheme,
} from '@envsemble/envui';
import { IconChevronRight } from '@envsemble/envui/icons/ChevronRight';
import { IconHome } from '@envsemble/envui/icons/Home';
import { planOptions } from './SelectOptions.fixture.js';

/** The 1.0 emphasis of each 0.7 variant, which the samples are still named by. */
const emphasis = {
  primary: { variant: 'primary' },
  secondary: { variant: 'secondary' },
  outlined: { variant: 'outline' },
  destructive: { variant: 'primary', tone: 'danger' },
  important: { variant: 'primary', tone: 'accent' },
  text: { variant: 'text' },
} as const;

function ColorControls({ theme }: { theme: ColorScheme }) {
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
        icon={<IconChevronRight />}
        aria-label={`${theme} chevron`}
        data-testid={`${theme}-icon-button`}
      />
      <NavigationDrawer
        aria-label={`${theme} navigation`}
        data-testid={`${theme}-navigation`}
        destinations={[
          { label: `${theme} navigation`, icon: <IconHome />, onClick: () => {} },
          {
            label: `${theme} selected navigation`,
            icon: <IconHome />,
            current: true,
            onClick: () => {},
          },
        ]}
      />
      <Column gap={3}>
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
            // The tabs whose fills the color specs measure aren't first: the first tab of a rail
            // draws its fill on a shape that reaches back over the rail's leading padding.
            {
              value: 'ghost',
              button: (
                <Button variant="ghost" startIcon={<IconHome />}>
                  Third tab
                </Button>
              ),
              content: 'Third panel',
            },
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
      </Column>
    </Theme>
  );
}

/**
 * Overrides of the semantic tokens on a nested Theme, which recolor its area alone, beside the same
 * controls outside it; and a button given its own colors through its color properties.
 */
function ColorOverrides() {
  return (
    <Theme theme="light" className="fixture-section" data-testid="color-overrides">
      <h2>Color overrides</h2>
      <Button data-testid="override-outside">Outside the area</Button>
      <Theme
        theme="light"
        data-testid="override-area"
        style={{
          '--env-color-bg-primary-emphasis': '#176f35',
          '--env-color-bg-primary-emphasis-hover': '#115a2a',
          '--env-color-bg-primary-emphasis-pressed': '#0b4520',
        }}
      >
        <Button data-testid="override-inside">Inside the area</Button>
        <Switch label="Inside the area" defaultChecked data-testid="override-switch" />
      </Theme>
      <div data-testid="custom-button-wrapper">
        <Button data-testid="custom-button-primary">Custom primary</Button>
        <Button variant="secondary" data-testid="custom-button-secondary">
          Custom secondary
        </Button>
        <Button variant="outline" data-testid="custom-button-outline">
          Custom outline
        </Button>
      </div>
    </Theme>
  );
}

/** The controls in light and in dark, and overrides of their colors. */
export default function ColorsFixture() {
  return (
    <>
      <ColorControls theme="light" />
      <ColorControls theme="dark" />
      <ColorOverrides />
    </>
  );
}
