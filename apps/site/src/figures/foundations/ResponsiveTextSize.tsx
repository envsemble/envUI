import {
  Avatar,
  Badge,
  Button,
  Column,
  DescriptionList,
  PageHeader,
  Surface,
} from '@envsemble/envui';
import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { useTimeline } from '../../motion/Timeline';
import { remPixels } from '@envui-internal/internal/lengths';
import { AtTextSize, CornerLabel, StepStack } from './Steps';
import { Figure } from './Topic';

/*
 * The Adapting to width foundation's figure of the reader's text size: one profile in a frame of
 * one width, at a larger text size step by step, falling back to its narrow form though the width
 * never changes.
 */

/** A profile's header and details, each following its own width. */
function Profile() {
  return (
    <Surface background="default" padding={5} radius="xl" render={<Column gap={5} />}>
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
    </Surface>
  );
}

/** The text sizes the profile steps through. */
const sizes = [1, 1.25, 2] as const;

/** Each text size's name in the corner, in plain words. */
const sizeNames = ['Usual text size', 'Larger text', 'Text twice the size'] as const;

/** The frame's width, in rem: wide enough for the profile's header to spread out at 100%. */
const frameWidth = 41;

/**
 * The scale the frame is drawn at, so it fits its stage: smaller on a narrow stage, but measured at
 * its own width, so the profile lays out as it would in a frame that wide.
 */
function useTextFit() {
  const place = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState(1);
  useLayoutEffect(() => {
    const element = place.current;
    if (!element) return;
    const measure = () => {
      setFit(Math.min(1, element.clientWidth / ((frameWidth + 1) * remPixels())));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return [place, fit] as const;
}

/**
 * The profile in its frame at each text size, with the size named in the corner: at the larger
 * sizes its actions move under the name, and then its labels above their values.
 */
function TextSizeSteps() {
  const step = useTimeline(sizes.map(() => 3000));
  const [place, fit] = useTextFit();
  return (
    <div ref={place} className="catalogue-class-text-place">
      <CornerLabel>{sizeNames[step]}</CornerLabel>
      <div style={{ zoom: fit } as CSSProperties}>
        <StepStack
          className="catalogue-fixed-frame catalogue-class-text-frame"
          count={sizes.length}
          at={step}
          render={(index) => (
            <AtTextSize size={sizes[index]!}>
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
    <Figure label="Larger text, narrower class" motion="the profile at each text size">
      <TextSizeSteps />
    </Figure>
  );
}
