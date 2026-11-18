'use client';

import { createContext } from 'react';
import type { Color } from '@react-stately/color';

export const ColorChangeContext = createContext<((color: Color) => void) | null>(null);
