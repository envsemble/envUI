export const exportSection = (name: string) => `props-${name}`;

export const propSection = (name: string, prop: string) => `props-${name}-${prop}`;

export const tokenSection = (cssVariable: string) => `token-${cssVariable.replace(/^--/, '')}`;

export function headingSlug(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}\p{Pc}\s-]/gu, '')
    .replace(/\s/g, '-');
}

export function headingSlugger(): (text: string) => string {
  const seen = new Map<string, number>();
  return (text) => {
    const slug = headingSlug(text);
    const count = seen.get(slug) ?? 0;
    seen.set(slug, count + 1);
    return count ? `${slug}-${count}` : slug;
  };
}
