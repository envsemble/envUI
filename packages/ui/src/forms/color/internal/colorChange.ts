'use client';

import { createContext } from 'react';
import type { Color } from '@react-stately/color';

/**
 * Receives each new color of the ColorPicker inside, as React Aria's Color, which keeps the hue of
 * a gray: ColorPickerButton keeps its own state with it, where the string onValueChange receives
 * would lose that hue.
 */
export const ColorChangeContext = createContext<((color: Color) => void) | null>(null);
