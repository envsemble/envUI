// Type tests: Surface, Stack and Text render another element through render, so their ref's element
// is a type parameter that the ref passed in sets: a ref to an HTMLElement, to a div or to the
// element render makes type-checks, as a callback ref does. Their props' ref is the default
// element's, a div or a paragraph, so a wrapper can forward it to that element.
import { useRef, type ComponentProps, type RefObject } from 'react';
import {
  Stack,
  Surface,
  Text,
  type StackProps,
  type SurfaceProps,
  type TextProps,
} from '@envsemble/envui';

export function Refs() {
  const region = useRef<HTMLElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const paragraph = useRef<HTMLParagraphElement>(null);
  return (
    <>
      <Surface ref={region} render={<section />} />
      <Surface ref={box} />
      <Stack ref={region} render={<footer />} />
      <Stack ref={box} />
      <Text ref={heading} render={<h2 />} />
      <Text ref={paragraph} />
      {/* A div ref where render makes the element a div, also on Text, whose default is a p. */}
      <Text ref={box} render={<div />} />
      <Surface ref={box} render={<div />} />
      <Text ref={(element: HTMLElement | null) => element?.focus()} />
    </>
  );
}

// A wrapper that forwards the props' ref to the default element, as 0.x's did.
export function Lead({ ref, variant: _variant, emphasis: _emphasis, ...props }: TextProps) {
  return <p ref={ref} {...props} />;
}
export function Column({ ref, direction: _direction, ...props }: StackProps) {
  return <div ref={ref} {...props} />;
}
export function Panel({ ref, background: _background, ...props }: SurfaceProps) {
  return <div ref={ref} {...props} />;
}
export function Paragraph({ ref }: { ref?: TextProps['ref'] }) {
  return <p ref={ref} />;
}
export function Box({ ref }: { ref?: StackProps['ref'] | SurfaceProps['ref'] }) {
  return <div ref={ref} />;
}
// A wrapper for another element names it.
export function Section({ ref, ...props }: SurfaceProps<HTMLElement>) {
  return <Surface ref={ref} render={<section />} {...props} />;
}

declare const drawing: RefObject<SVGSVGElement | null>;
// @ts-expect-error A ref to something that is not an HTML element still fails.
export const notAnElement = <Surface ref={drawing} />;

declare const props: ComponentProps<typeof Text>;
export const forwarded = <Text {...props} />;
