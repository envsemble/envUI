/// <reference types="vite/client" />

/** The release tag or commit that links to envUI's source files point at; see vite.config.ts. */
declare const __ENVUI_SOURCE_REVISION__: string;

/** The release notes, newest first: scripts/site/ReleaseNotes.ts. */
declare module 'virtual:envui-release-notes' {
  const releases: import('./pages/SiteData').Release[];
  export default releases;
}
