// Type tests: Surface, Stack and Text render another element through render, so their ref is the
// rendered element, an HTMLElement: a ref to an HTMLElement, to a div or to the element render
// makes type-checks, as a callback ref does.
import { useRef, type RefObject } from 'react';
import { Stack, Surface, Text } from '@envsemble/envui';

export function Refs() {
  const region = useRef<HTMLElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  return (
    <>
      <Surface ref={region} render={<section />} />
      <Surface ref={box} />
      <Stack ref={region} render={<footer />} />
      <Stack ref={box} />
      <Text ref={heading} render={<h2 />} />
      <Text ref={(element: HTMLElement | null) => element?.focus()} />
    </>
  );
}

declare const drawing: RefObject<SVGSVGElement | null>;
// @ts-expect-error A ref to something that is not an HTML element still fails.
export const notAnElement = <Surface ref={drawing} />;
