/**
 * The nominal viewports and scales a template screen is shown in: the template previews, and the
 * tests and screenshots that open the frame route, share them.
 */
export const templateWidths = [
  { value: 'desktop', label: 'Desktop', width: 1280, height: 800 },
  { value: 'tablet', label: 'Tablet', width: 834, height: 1112 },
  { value: 'phone', label: 'Phone', width: 390, height: 844 },
] as const;
export const templateScales = [
  { value: 'comfortable', label: 'Comfortable' },
  { value: 'compact', label: 'Compact' },
] as const;
