/// <reference types="vite/client" />

/** The release notes, newest first: scripts/site/ReleaseNotes.ts. */
declare module 'virtual:envui-release-notes' {
  const releases: import('./pages/SiteData').Release[];
  export default releases;
}

/**
 * The recorded size of each part that loads with a page, by its key (template/PartSizes.json): in a
 * build, only those of no one page's, as each page's content brings its own (vite.config.ts).
 */
declare module 'virtual:envui-part-sizes' {
  const sizes: Record<string, readonly [number, number]>;
  export default sizes;
}

/**
 * The lines of each example's code, by page/Name: scripts/site/PartOutlines.ts. In a build, none,
 * as each page's content brings its own.
 */
declare module 'virtual:envui-example-lines' {
  const lines: Record<string, number>;
  export default lines;
}

/** Each release of the changelog: its heading and the shape of its text (PartOutlines.ts). */
declare module 'virtual:envui-changelog-outline' {
  const releases: { heading: string; shape: string }[];
  export default releases;
}

/**
 * The token reference's groups, each with a row for each token: its name, the length of its
 * description and of each value (PartOutlines.ts).
 */
declare module 'virtual:envui-token-outline' {
  const groups: { title: string; colors: boolean; rows: [string, number, ...number[]][] }[];
  export default groups;
}
