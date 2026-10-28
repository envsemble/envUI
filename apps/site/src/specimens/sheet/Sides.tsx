import { Button, Column, DescriptionList, Row, Sheet } from '@envsemble/envui';
import { Example } from '../../figures/Example';
import { usePointer, type PointerStep } from '../../motion/Motion';
import { MotionStage } from '../../motion/MotionStage';

const trigger = (index: number) => `.catalogue-sheet-sides > .env-button:nth-child(${index})`;
const close = '.env-sheet-popup .env-dialog-heading > .env-button';

/*
 * The pointer opens the report's details, which slide in from the end, and closes them; then its
 * outline, from the start; then its share choices, from the bottom, each closed again.
 */
const script: PointerStep[] = [
  { wait: 500 },
  ...[1, 2, 3].flatMap((index): PointerStep[] => [
    { to: trigger(index), x: 0.5, y: 0.6, duration: index === 1 ? 0 : 500 },
    { wait: 350 },
    { click: true },
    { wait: 1300 },
    { to: close, duration: 550 },
    { wait: 300 },
    { click: true },
    { wait: 700 },
  ]),
  { leave: true },
  { wait: 600 },
];

function Opening() {
  usePointer(script);
  return (
    <Row gap={3} justify="center" className="catalogue-sheet-sides">
      <Sheet
        title="Details"
        description="Quarterly report"
        closeLabel="Close details"
        trigger={<Button variant="secondary">Details</Button>}
      >
        <DescriptionList.Root aria-label="Report details">
          <DescriptionList.Item label="Owner">Priya Shah</DescriptionList.Item>
          <DescriptionList.Item label="Updated">12 March 2026</DescriptionList.Item>
          <DescriptionList.Item label="Pages">18</DescriptionList.Item>
        </DescriptionList.Root>
      </Sheet>
      <Sheet
        side="start"
        title="Outline"
        closeLabel="Close outline"
        trigger={<Button variant="secondary">Outline</Button>}
      >
        <Column gap={2}>
          {['Summary', 'Revenue', 'Costs', 'Next quarter'].map((section) => (
            <Button key={section} variant="text">
              {section}
            </Button>
          ))}
        </Column>
      </Sheet>
      <Sheet
        side="bottom"
        title="Share report"
        closeLabel="Close"
        trigger={<Button variant="secondary">Share</Button>}
      >
        <Row gap={2}>
          <Button variant="secondary">Copy link</Button>
          <Button variant="secondary">Email</Button>
        </Row>
      </Sheet>
    </Row>
  );
}

/** A sheet from each side: the end, the start and the bottom, opened and closed in turn. */
export default function Sides() {
  return (
    <Example size="content">
      <MotionStage label="a sheet from each side" height="22rem">
        <Opening />
      </MotionStage>
    </Example>
  );
}
