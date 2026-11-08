import {
  Badge,
  Button,
  EnvUIProvider,
  Slider,
  Surface,
  Tabs,
  Text,
  Theme,
  type ColorScheme,
} from '@envsemble/envui';

const fillViews = ['Canvas', 'Outline', 'History'];

/**
 * Filling Tabs that keep their inactive panels mounted: one with a nested Tabs in its first panel,
 * and a vertical one whose list sits beside a heading through renderList.
 */
export function FillTabsFixture({ theme }: { theme: ColorScheme }) {
  const items = (nested: boolean) =>
    fillViews.map((view, index) => ({
      value: view.toLowerCase(),
      button: <Button>{view}</Button>,
      content:
        nested && index === 0 ? (
          <Tabs
            aria-label={`Canvas layers ${theme}`}
            keepMounted
            items={['Shapes', 'Notes'].map((layer) => ({
              value: layer.toLowerCase(),
              button: <Button>{layer}</Button>,
              content: <Text>{layer}</Text>,
            }))}
          />
        ) : (
          <Text>{view}</Text>
        ),
    }));
  return (
    <Theme theme={theme} data-testid={`fill-tabs-${theme}`} className="fixture-section">
      <div className="fixture-fill-frame">
        <Tabs
          aria-label={`Filling views ${theme}`}
          fill
          keepMounted
          className="fixture-fill-tabs"
          items={items(true)}
        />
      </div>
      <div className="fixture-fill-frame">
        <Tabs
          aria-label={`Vertical filling views ${theme}`}
          fill
          keepMounted
          orientation="vertical"
          className="fixture-fill-tabs"
          renderList={(list) => (
            <div className="fixture-tabs-heading">
              <Text render={<h3 />} variant="title">
                Views
              </Text>
              {list}
            </div>
          )}
          items={items(false)}
        />
      </div>
    </Theme>
  );
}

/** The 1.0 emphasis of each 0.7 variant, which the samples are still named by. */
const emphasis = {
  primary: { variant: 'primary' },
  secondary: { variant: 'secondary' },
  outlined: { variant: 'outline' },
  destructive: { variant: 'primary', tone: 'danger' },
  important: { variant: 'primary', tone: 'accent' },
  text: { variant: 'text' },
} as const;
const tabStateVariants = ['primary', 'secondary', 'outlined', 'important'] as const;

/**
 * Tabs built from each kind of button used as a tab, in both scales on the canvas: the first tab is
 * selected and the second is not.
 */
export function TabStatesFixture({ theme }: { theme: ColorScheme }) {
  return (
    <Theme theme={theme} data-testid={`tab-states-${theme}`} className="fixture-section">
      {(['comfortable', 'compact'] as const).map((scale) => (
        <Theme key={scale} theme={theme} scale={scale} className="fixture-tab-states">
          {tabStateVariants.map((variant) => (
            <Tabs
              key={variant}
              aria-label={`${variant} tabs, ${scale} ${theme}`}
              items={['Summary', 'Details'].map((label) => ({
                value: label.toLowerCase(),
                button: <Button {...emphasis[variant]}>{label}</Button>,
                content: null,
              }))}
            />
          ))}
        </Theme>
      ))}
    </Theme>
  );
}

/** Compact tabs with a counter in a compact bar, mounted with ?fixture=compact-tabs. */
export function CompactTabsFixture({ theme }: { theme: ColorScheme }) {
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

const directionItems = ['One', 'Two', 'Three'].map((label) => ({
  value: label.toLowerCase(),
  button: <Button variant="secondary">{label}</Button>,
  content: <p>{label} panel</p>,
}));

/**
 * Tabs in right-to-left text, from a dir attribute and from EnvUIProvider's dir, mounted with
 * ?fixture=rtl-tabs.
 */
export function RtlTabsFixture() {
  return (
    <>
      <div dir="rtl">
        <Tabs aria-label="Right-to-left tabs" items={directionItems} />
      </div>
      <EnvUIProvider dir="rtl">
        <Tabs aria-label="Provider tabs" items={directionItems} />
      </EnvUIProvider>
      {/* A left-to-right region in a panel of right-to-left tabs keeps its own direction. */}
      <div dir="rtl">
        <Tabs
          aria-label="Tabs around a slider"
          items={[
            {
              value: 'volume',
              button: <Button variant="secondary">Volume</Button>,
              content: (
                <div dir="ltr">
                  <Slider label="Volume" defaultValue={50} />
                </div>
              ),
            },
          ]}
        />
      </div>
    </>
  );
}

const views = ['Summary', 'Files', 'Activity', 'Members', 'Settings'];

/**
 * A rail with more tabs than fit, its first tab chosen, in a narrow frame that is positioned and set
 * in from the page's start, mounted with ?fixture=scrolling-tabs.
 */
export function ScrollingTabsFixture() {
  return (
    <div
      style={{
        position: 'relative',
        boxSizing: 'border-box',
        paddingInlineStart: '20rem',
        inlineSize: '40rem',
      }}
    >
      <Tabs
        aria-label="Project views"
        items={views.map((view) => ({
          value: view,
          button: <Button>{view}</Button>,
          content: null,
        }))}
      />
    </div>
  );
}
