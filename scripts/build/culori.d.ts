// The parts of culori that scripts/build/GeneratePalette.ts uses: culori ships no types.
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
  export type Color = Rgb | Oklch;
  export function converter(mode: 'rgb'): (color: Color | undefined) => Rgb;
  export function converter(mode: 'oklch'): (color: Color | undefined) => Oklch;
  export function formatHex(color: Color | undefined): string;
  export function parse(color: string): Color | undefined;
  export function wcagLuminance(color: Color | undefined): number;
}
