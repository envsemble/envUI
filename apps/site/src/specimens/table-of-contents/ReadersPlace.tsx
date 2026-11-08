import { useRef, type MouseEvent } from 'react';
import { Column, Row, Surface, TableOfContents, Text } from '@envsemble/envui';
import { SpecimenFrame } from '../../figures/SpecimenFrame';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../motion/MotionStage';

/** The guide's sections, with ids of the figure's own, as a page holds them once. */
const sections = [
  { id: 'catalogue-readers-place-install', title: 'Install' },
  { id: 'catalogue-readers-place-configure', title: 'Configure' },
  { id: 'catalogue-readers-place-deploy', title: 'Deploy' },
  { id: 'catalogue-readers-place-monitor', title: 'Monitor' },
];

/** A section's entry in the contents, by its place in the guide, from 1. */
const entry = (index: number) => `.env-table-of-contents-link[href="#${sections[index - 1].id}"]`;

/*
 * The reader scrolls the guide down a section, the shape beside the contents gliding with their
 * place; the pointer presses Deploy, and the guide scrolls that section to its top, below the
 * guide's header, which stays; the pointer rests on a later entry, which swells the shape a
 * little; and the guide scrolls back to its start.
 */
const script: PointerStep[] = [
  { wait: 900 },
  { cue: 'next' },
  { wait: 1400 },
  { to: entry(3), x: 0.3, y: 0.5 },
  { wait: 500 },
  { click: true },
  { wait: 1600 },
  { to: entry(4), x: 0.3, y: 0.5, duration: 400 },
  { wait: 1100 },
  { leave: true },
  { wait: 400 },
  { cue: 'start' },
  { wait: 1500 },
];

function Reading() {
  const guide = useRef<HTMLDivElement>(null);
  const header = useRef<HTMLDivElement>(null);
  const at = useRef(0);
  /** Scrolls the guide to a section, its top just below the header. */
  const show = (index: number) => {
    const element = guide.current;
    if (!element) return;
    at.current = index;
    const section = element.querySelector<HTMLElement>(`#${sections[index].id}`);
    // The guide is the sections' offset parent, so a section's offset is its scroll position.
    const top = (section?.offsetTop ?? 0) - (header.current?.offsetHeight ?? 0);
    element.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  };
  usePointer(script, {
    onCue: (cue) => show(cue === 'start' ? 0 : Math.min(at.current + 1, sections.length - 1)),
  });
  // A link scrolls its section to the top of the page and puts it in the address; on the stage,
  // the figure scrolls its guide there instead, as the link does the page.
  const follow = (event: MouseEvent) => {
    const link = event.target instanceof Element ? event.target.closest('a') : null;
    const index = sections.findIndex(({ id }) => link?.getAttribute('href') === `#${id}`);
    if (index < 0) return;
    event.preventDefault();
    show(index);
  };
  return (
    <Row gap={6} align="start" onClickCapture={follow}>
      {/* The guide, a pane that scrolls under its header, which stays. */}
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
          // On the pane's own fill, so the sections pass under it.
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

/** TableOfContents beside a guide as it scrolls: the shape beside it marks the reader's place. */
export default function ReadersPlace() {
  return (
    <SpecimenFrame size="content">
      <MotionStage label="the contents following the reader" stage="shaded">
        <Reading />
      </MotionStage>
    </SpecimenFrame>
  );
}
