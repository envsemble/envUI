// The parts of culori that scripts/build and the contrast gate (tests/contrast/Contrast.ts) use:
// culori ships no types.
declare module 'culori' {
  export interface Rgb {
    mode: 'rgb';
    r: number;
    g: number;
    b: number;
    alpha?: number;
  }
  export interface Oklch {
    mode: 'oklch';
    l: number;
    c: number;
    h?: number;
    alpha?: number;
  }
  export interface Hsl {
    mode: 'hsl';
    h: number;
    s: number;
    l: number;
    alpha?: number;
  }
  export type Color = Rgb | Oklch | Hsl;
  export function converter(mode: 'rgb'): (color: Color | undefined) => Rgb;
  export function converter(mode: 'oklch'): (color: Color | undefined) => Oklch;
  export function formatHex(color: Color | undefined): string;
  export function parse(color: string): Color | undefined;
  export function wcagLuminance(color: Color | undefined): number;
  export function clampRgb(color: Rgb): Rgb;
  export function blend(colors: Rgb[], mode: 'normal', space: 'rgb'): Rgb;
  export function wcagContrast(a: Rgb, b: Rgb): number;
  export function differenceEuclidean(mode: 'oklab'): (a: Rgb, b: Rgb) => number;
}
