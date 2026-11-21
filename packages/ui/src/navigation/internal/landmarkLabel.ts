export const landmarkLabel = (
  label: string | undefined,
  labelledBy: string | undefined,
  fallback: string,
) => label ?? (labelledBy === undefined ? fallback : undefined);
