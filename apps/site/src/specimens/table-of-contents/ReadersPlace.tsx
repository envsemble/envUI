import { useRef, type MouseEvent } from 'react';
import { Column, Row, Surface, TableOfContents, Text } from '@envsemble/envui';
import { SpecimenFrame } from '../../figures/SpecimenFrame';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const sections = [
  { id: 'catalogue-readers-place-install', title: 'Install' },
  { id: 'catalogue-readers-place-configure', title: 'Configure' },
  { id: 'catalogue-readers-place-deploy', title: 'Deploy' },
  { id: 'catalogue-readers-place-monitor', title: 'Monitor' },
];

const entry = (placeFromOne: number) =>
  `.env-table-of-contents-link[href="#${sections[placeFromOne - 1].id}"]`;

const script: PointerStep[] = [
  { wait: 540 },
  { cue: 'next' },
  { wait: 840 },
  { to: entry(3), x: 0.3, y: 0.5 },
  { wait: 300 },
  { click: true },
  { wait: 960 },
  { to: entry(4), x: 0.3, y: 0.5, duration: 400 },
  { wait: 660 },
  { leave: true },
  { wait: 240 },
  { cue: 'start' },
  { wait: 900 },
];

function Reading() {
  const guide = useRef<HTMLDivElement>(null);
  const header = useRef<HTMLDivElement>(null);
  const at = useRef(0);
  const scrollSectionBelowHeader = (index: number) => {
    const element = guide.current;
    if (!element) return;
    at.current = index;
    const section = element.querySelector<HTMLElement>(`#${sections[index].id}`);
    const sectionScrollTopInGuide = section?.offsetTop ?? 0;
    const top = sectionScrollTopInGuide - (header.current?.offsetHeight ?? 0);
    element.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  };
  usePointer(script, {
    onCue: (cue) =>
      scrollSectionBelowHeader(cue === 'start' ? 0 : Math.min(at.current + 1, sections.length - 1)),
  });
  const scrollGuideInsteadOfPage = (event: MouseEvent) => {
    const link = event.target instanceof Element ? event.target.closest('a') : null;
    const index = sections.findIndex(({ id }) => link?.getAttribute('href') === `#${id}`);
    if (index < 0) return;
    event.preventDefault();
    scrollSectionBelowHeader(index);
  };
  return (
    <Row gap={6} align="start" onClickCapture={scrollGuideInsteadOfPage}>
      <Surface
        ref={guide}
        radius="sm"
        padding={0}
        style={{
          blockSize: '12rem',
          inlineSize: '16rem',
          overflowY: 'auto',
          position: 'relative',
          paddingInline: 'var(--env-space-4)',
        }}
      >
        <div
          ref={header}
          style={{
            position: 'sticky',
            insetBlockStart: 0,
            zIndex: 1,
            paddingBlock: 'var(--env-space-3)',
            background: 'inherit',
          }}
        >
          <Text variant="caption" emphasis="muted">
            Deployment guide
          </Text>
        </div>
        <Column gap={6} style={{ paddingBlockEnd: '8rem' }}>
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
      </Surface>
      <TableOfContents
        aria-label="Sections of the guide"
        style={{ inlineSize: '9rem' }}
        items={sections.map(({ id, title }) => ({ id, label: title }))}
      />
    </Row>
  );
}

export default function ReadersPlace() {
  return (
    <SpecimenFrame size="content">
      <MotionStage label="the contents following the reader" stage="shaded">
        <Reading />
      </MotionStage>
    </SpecimenFrame>
  );
}
