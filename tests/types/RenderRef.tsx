import { useRef, type ComponentProps, type RefObject } from 'react';
import {
  Box,
  Column,
  Grid,
  Row,
  Surface,
  Text,
  type BoxProps,
  type RowProps,
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
      <Row ref={region} render={<footer />} />
      <Row ref={box} />
      <Column ref={region} render={<section />} />
      <Column ref={box} />
      <Grid ref={region} render={<ul />} columns={{ min: '12rem' }} />
      <Box ref={box} container="details" />
      <Text ref={heading} render={<h2 />} />
      <Text ref={paragraph} />
      <Text ref={box} render={<div />} />
      <Surface ref={box} render={<div />} />
      <Text ref={(element: HTMLElement | null) => element?.focus()} />
    </>
  );
}

export function Lead({ ref, variant: _variant, emphasis: _emphasis, ...props }: TextProps) {
  return <p ref={ref} {...props} />;
}
export function Strip({ ref, wrap: _wrap, ...props }: RowProps) {
  return <div ref={ref} {...props} />;
}
export function Panel({ ref, background: _background, ...props }: SurfaceProps) {
  return <div ref={ref} {...props} />;
}
export function Paragraph({ ref }: { ref?: TextProps['ref'] }) {
  return <p ref={ref} />;
}
export function Block({ ref }: { ref?: BoxProps['ref'] | SurfaceProps['ref'] }) {
  return <div ref={ref} />;
}
export function Section({ ref, ...props }: SurfaceProps<HTMLElement>) {
  return <Surface ref={ref} render={<section />} {...props} />;
}

declare const drawing: RefObject<SVGSVGElement | null>;
// @ts-expect-error
export const refToANonHtmlElementFails = <Surface ref={drawing} />;

// @ts-expect-error
export const minimumColumnWidthTakesRem = <Grid columns={{ min: '200px' }} />;

declare const props: ComponentProps<typeof Text>;
export const forwarded = <Text {...props} />;
