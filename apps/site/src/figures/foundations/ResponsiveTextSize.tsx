import { Avatar, Badge, Button, Column, DescriptionList, PageHeader } from '@envsemble/envui';
import { useLayoutEffect, useRef, useState } from 'react';
import { useTimeline } from '../../motion/Timeline';
import { remPixels } from '../../shared/Lengths';
import { AtTextSize, CornerLabel, StepStack } from './Steps';
import { FoundationFrame } from './FoundationFrame';
import { remeasure } from '../../shared/Remeasure';

function Profile() {
  return (
    <Column gap={5}>
      <PageHeader
        title="Sam Lee"
        headingLevel={3}
        description="Product designer"
        start={<Avatar name="Sam Lee" />}
        meta={<Badge>Admin</Badge>}
        actions={
          <>
            <Button variant="secondary">Message</Button>
            <Button>Edit profile</Button>
          </>
        }
      />
      <DescriptionList.Root aria-label="Profile details">
        <DescriptionList.Item label="Team">Research</DescriptionList.Item>
      </DescriptionList.Root>
    </Column>
  );
}

const textScales = [1, 1.25, 2] as const;

const sizeNames = ['Usual text size', 'Larger text', 'Text twice the size'] as const;

const frameWidthRem = 41;

const textSizeStepMs = 1800;

function useTextFit() {
  const place = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState(1);
  useLayoutEffect(() => {
    const element = place.current;
    if (!element) return;
    const measure = () => {
      setFit(Math.min(1, element.clientWidth / ((frameWidthRem + 1) * remPixels())));
    };
    return remeasure(measure, { first: 'now', resize: [element] }).stop;
  }, []);
  return [place, fit] as const;
}

function TextSizeSteps() {
  const step = useTimeline(textScales.map(() => textSizeStepMs));
  const [place, fit] = useTextFit();
  return (
    <div ref={place} className="catalogue-class-text-place">
      <CornerLabel>{sizeNames[step]}</CornerLabel>
      <div style={{ zoom: fit }}>
        <StepStack
          className="catalogue-fixed-frame catalogue-class-text-frame"
          count={textScales.length}
          at={step}
          render={(index) => (
            <AtTextSize size={textScales[index]!}>
              <Profile />
            </AtTextSize>
          )}
        />
      </div>
    </div>
  );
}

export function ClassTextSizeFigure() {
  return (
    <FoundationFrame label="Larger text, narrower class" motion="the profile at each text size">
      <TextSizeSteps />
    </FoundationFrame>
  );
}
