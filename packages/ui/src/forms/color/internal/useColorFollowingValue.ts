'use client';

import { useState } from 'react';
import { sameColor, toColor, type ColorValue } from './colorValue.js';

export function useColorFollowingValue(
  value: ColorValue | undefined,
  defaultValue: ColorValue,
  alpha: boolean,
) {
  const [own, setOwn] = useState(() => toColor(value ?? defaultValue, alpha));
  const external = value === undefined ? undefined : toColor(value, alpha);
  const applicationReplacedColor = external !== undefined && !sameColor(own, external);
  const color = applicationReplacedColor ? external : own;
  const reset = () => setOwn(toColor(defaultValue, alpha));
  return { color, setOwn, reset, controlled: value !== undefined };
}
