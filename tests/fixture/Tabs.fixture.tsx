import { Button, Tabs, Text, Theme, type ColorScheme } from '@envsemble/envui';

export const themes = true;

const fillViews = ['Canvas', 'Outline', 'History'];

export default function TabsFixture({ theme }: { theme: ColorScheme }) {
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
          aria-label={`Headed filling views ${theme}`}
          fill
          keepMounted
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
