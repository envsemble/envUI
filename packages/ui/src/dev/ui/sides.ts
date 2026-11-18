export interface Sides {
  tree: boolean;
  inspector: boolean;
  treeWidth: number;
  inspectorWidth: number;
}

const sidesKey = 'envui-dev-sidebars';

export const sideWidthsRem = {
  tree: { default: 16, min: 12, max: 200 },
  inspector: { default: 22, min: 16, max: 200 },
} as const;

const defaultSides: Sides = {
  tree: true,
  inspector: true,
  treeWidth: sideWidthsRem.tree.default,
  inspectorWidth: sideWidthsRem.inspector.default,
};

const storedWidthOr = (value: unknown, otherwise: number) =>
  typeof value === 'number' && Number.isFinite(value) ? value : otherwise;

export function loadSides(): Sides {
  try {
    const stored = JSON.parse(localStorage.getItem(sidesKey) ?? 'null') as unknown;
    if (stored && typeof stored === 'object') {
      const value = stored as Partial<Record<keyof Sides, unknown>>;
      return {
        tree: value.tree !== false,
        inspector: value.inspector !== false,
        treeWidth: storedWidthOr(value.treeWidth, defaultSides.treeWidth),
        inspectorWidth: storedWidthOr(value.inspectorWidth, defaultSides.inspectorWidth),
      };
    }
  } catch {
    return defaultSides;
  }
  return defaultSides;
}

export function saveSides(sides: Sides): boolean {
  try {
    localStorage.setItem(sidesKey, JSON.stringify(sides));
    return true;
  } catch {
    return false;
  }
}
