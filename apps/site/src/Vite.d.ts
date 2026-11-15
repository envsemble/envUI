/// <reference types="vite/client" />

declare module 'virtual:envui-release-notes' {
  const releases: import('./pages/docs/ReleaseNotesData').Release[];
  export default releases;
}

declare module 'virtual:envui-part-sizes' {
  const sizes: Record<string, readonly [widthRem: number, heightRem: number]>;
  export default sizes;
}

declare module 'virtual:envui-example-lines' {
  const lines: Record<string, number>;
  export default lines;
}

declare module 'virtual:envui-changelog-outline' {
  const releases: { heading: string; shape: string }[];
  export default releases;
}

declare module 'virtual:envui-token-outline' {
  const groups: {
    title: string;
    colors: boolean;
    rows: [name: string, descriptionLength: number, ...valueLengths: number[]][];
  }[];
  export default groups;
}
