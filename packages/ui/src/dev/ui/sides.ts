// Dev mode's sidebars: whether each shows, and its width in rem, which people set by dragging its
// edge. The choice is kept in localStorage, so the next dev mode opens as the last one was left.

export interface Sides {
  tree: boolean;
  inspector: boolean;
  /** The node tree's width in rem. */
  treeWidth: number;
  /** The inspector's width in rem. */
  inspectorWidth: number;
}

export const sidesKey = 'envui-dev-sidebars';

/**
 * The width each sidebar starts at, and its least and largest, in rem. The room the window leaves
 * beside the other sidebar and the view limits it first.
 */
export const sideWidths = {
  tree: { default: 16, min: 12, max: 200 },
  inspector: { default: 22, min: 16, max: 200 },
} as const;

const fallback: Sides = {
  tree: true,
  inspector: true,
  treeWidth: sideWidths.tree.default,
  inspectorWidth: sideWidths.inspector.default,
};

const widthOr = (value: unknown, otherwise: number) =>
  typeof value === 'number' && Number.isFinite(value) ? value : otherwise;

/** The sidebars as they were last left, or both shown at their default widths. */
export function loadSides(): Sides {
  try {
    const stored = JSON.parse(localStorage.getItem(sidesKey) ?? 'null') as unknown;
    if (stored && typeof stored === 'object') {
      const value = stored as Partial<Record<keyof Sides, unknown>>;
      return {
        tree: value.tree !== false,
        inspector: value.inspector !== false,
        treeWidth: widthOr(value.treeWidth, fallback.treeWidth),
        inspectorWidth: widthOr(value.inspectorWidth, fallback.inspectorWidth),
      };
    }
  } catch {
    // No storage, as in a private window, or something else under the key: the defaults.
  }
  return fallback;
}

export function saveSides(sides: Sides) {
  try {
    localStorage.setItem(sidesKey, JSON.stringify(sides));
  } catch {
    // No storage: the sidebars stay as they are until the page reloads.
  }
}
