import { Button, EnvUIProvider, Slider, Tabs } from '@envsemble/envui';

export const mount = 'standalone';

const directionItems = ['One', 'Two', 'Three'].map((label) => ({
  value: label.toLowerCase(),
  button: <Button variant="secondary">{label}</Button>,
  content: <p>{label} panel</p>,
}));

/** Tabs in right-to-left text, from a dir attribute and from EnvUIProvider's dir. */
export default function TabsRtlFixture() {
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
