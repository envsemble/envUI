// The parts of culori that the contrast gate uses (Contrast.ts): culori ships no types.
declare module 'culori' {
  interface Rgb {
    mode: 'rgb';
    r: number;
    g: number;
    b: number;
    alpha?: number;
  }
  export function parse(color: string): { mode: string } | undefined;
  export function converter(mode: 'rgb'): (color: { mode: string }) => Rgb;
  export function clampRgb(color: Rgb): Rgb;
  export function blend(colors: Rgb[], mode: 'normal', space: 'rgb'): Rgb;
  export function wcagContrast(a: Rgb, b: Rgb): number;
  export function differenceEuclidean(mode: 'oklab'): (a: Rgb, b: Rgb) => number;
}
