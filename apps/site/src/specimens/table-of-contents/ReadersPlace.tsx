import { useRef } from 'react';
import { Column, Row, TableOfContents, Text } from '@envsemble/envui';
import { Example } from '../../previews/Example';
import { usePointer, type PointerStep } from '../../previews/Motion';
import { MotionStage } from '../../previews/MotionStage';

/** The guide's sections, with ids of the figure's own, as a page holds them once. */
const sections = [
  { id: 'catalogue-readers-place-install', title: 'Install' },
  { id: 'catalogue-readers-place-configure', title: 'Configure' },
  { id: 'catalogue-readers-place-deploy', title: 'Deploy' },
  { id: 'catalogue-readers-place-monitor', title: 'Monitor' },
];

const entry = (index: number) =>
  `.env-table-of-contents-link:nth-child(${index} of .env-table-of-contents-link)`;

/*
 * The reader scrolls the guide down a section at a time, to its end, the dashes swelling around
 * their place as they go; the pointer rests on a later section's entry, whose dash lengthens;
 * and the guide scrolls back to its start.
 */
const script: PointerStep[] = [
  { wait: 900 },
  { cue: 'next' },
  { wait: 1300 },
  { cue: 'next' },
  { wait: 1300 },
  { cue: 'next' },
  { wait: 1300 },
  { to: entry(2) },
  { wait: 1100 },
  { leave: true },
  { wait: 400 },
  { cue: 'start' },
  { wait: 1500 },
];

function Reading() {
  const guide = useRef<HTMLDivElement>(null);
  const at = useRef(0);
  usePointer(script, {
    onCue: (cue) => {
      const element = guide.current;
      if (!element) return;
      at.current = cue === 'start' ? 0 : Math.min(at.current + 1, sections.length - 1);
      const section = element.querySelector<HTMLElement>(`#${sections[at.current]!.id}`);
      // The guide is the sections' offset parent, so a section's offset is its scroll position.
      element.scrollTo({ top: section?.offsetTop ?? 0, behavior: 'smooth' });
    },
  });
  return (
    <Row gap={6} align="start">
      <div
        ref={guide}
        style={{ blockSize: '11rem', inlineSize: '15rem', overflowY: 'auto', position: 'relative' }}
      >
        <Column gap={6} style={{ paddingBlockEnd: '7rem' }}>
          {sections.map(({ id, title }) => (
            <Column key={id} id={id} gap={2}>
              <Text variant="title" render={<h3 />}>
                {title}
              </Text>
              <Text variant="body-sm" emphasis="muted">
                A few lines of the guide, as a reader would find them in this section.
              </Text>
            </Column>
          ))}
        </Column>
      </div>
      <TableOfContents
        aria-label="Sections of the guide"
        style={{ inlineSize: '9rem' }}
        items={sections.map(({ id, title }) => ({ id, label: title }))}
      />
    </Row>
  );
}

/** TableOfContents beside a guide as it scrolls: the dashes mark the reader's place. */
export default function ReadersPlace() {
  return (
    <Example size="content">
      <MotionStage label="the contents following the reader">
        <Reading />
      </MotionStage>
    </Example>
  );
}
