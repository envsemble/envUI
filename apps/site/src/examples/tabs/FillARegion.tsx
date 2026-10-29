import { Column, Row, Surface, Tabs, Text } from '@envsemble/envui';
import type { ReactNode } from 'react';
import { IconArrowForward } from '@envsemble/envui/icons/ArrowForward';

const steps = ['Draft', 'Review', 'Publish'];

function View({ children }: { children: ReactNode }) {
  return (
    // The view fills the panel, as a canvas would.
    <Surface background="muted" style={{ flex: 1, display: 'grid', placeItems: 'center' }}>
      {children}
    </Surface>
  );
}

function Diagram() {
  return (
    <Row gap={2} align="center">
      {steps.map((step, index) => (
        <Row key={step} gap={2} align="center">
          {index > 0 && <IconArrowForward />}
          <Surface background="default" padding={3} radius="sm">
            <Text>{step}</Text>
          </Surface>
        </Row>
      ))}
    </Row>
  );
}

function Outline() {
  return (
    <Column render={<ol />} gap={1} style={{ margin: 0 }}>
      {steps.map((step) => (
        <Text key={step} render={<li />}>
          {step}
        </Text>
      ))}
    </Column>
  );
}

export default function FillARegion() {
  return (
    // The region has a size of its own, as an application's layout gives it.
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        inlineSize: 'min(100%, 32rem)',
        blockSize: '16rem',
      }}
    >
      <Tabs
        aria-label="Diagram views"
        fill
        style={{ flex: 1 }}
        items={[
          {
            value: 'canvas',
            label: 'Canvas',
            content: (
              <View>
                <Diagram />
              </View>
            ),
          },
          {
            value: 'outline',
            label: 'Outline',
            content: (
              <View>
                <Outline />
              </View>
            ),
          },
        ]}
      />
    </div>
  );
}
