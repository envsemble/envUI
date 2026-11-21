export const partKinds = ['example', 'specimen', 'open', 'figure'] as const;

export type PartKind = (typeof partKinds)[number];

export const partKey = (kind: PartKind, page: string, name: string) => `${kind}:${page}/${name}`;
