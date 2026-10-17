import { Stack, Text, WindowFrame } from '@envsemble/envui';

const sections = ['Overview', 'Milestones', 'Risks'];

/** Stands in for the window, which WindowFrame fills. */
const frame = {
  position: 'relative',
  blockSize: '16rem',
  overflow: 'hidden',
  borderRadius: '1.75rem',
  transform: 'translateZ(0)',
} as const;

/** A section heading that sticks at the top of the window's content, below the title bar. */
const heading = {
  position: 'sticky',
  insetBlockStart: 'var(--env-frame-sticky-top)',
  padding: '0.5rem 1.5rem',
  background: 'var(--env-color-bg-page)',
} as const;

export default function StickySection() {
  return (
    <div style={frame}>
      <WindowFrame.Root>
        <WindowFrame.TitleBar>Launch plan</WindowFrame.TitleBar>
        <WindowFrame.Content>
          {sections.map((section) => (
            <section key={section}>
              <Text render={<h3 />} variant="title" style={heading}>
                {section}
              </Text>
              <Stack gap={2} style={{ padding: '0 1.5rem 1.5rem' }}>
                {Array.from({ length: 4 }, (_, index) => (
                  <Text key={index} emphasis="muted">
                    {section} note {index + 1}
                  </Text>
                ))}
              </Stack>
            </section>
          ))}
        </WindowFrame.Content>
      </WindowFrame.Root>
    </div>
  );
}
