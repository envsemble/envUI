/// <reference types="vite/client" />

/** The release tag or commit that links to envUI's source files point at; see vite.config.ts. */
declare const __ENVUI_SOURCE_REVISION__: string;

/** The agent benchmark's saved runs, oldest first, and the newest: scripts/BenchmarkResults.mjs. */
declare module 'virtual:envui-benchmark' {
  const benchmark: import('./pages/SiteData').Benchmark;
  export default benchmark;
}

/** The release notes, newest first: scripts/ReleaseNotes.mjs. */
declare module 'virtual:envui-release-notes' {
  const releases: import('./pages/SiteData').Release[];
  export default releases;
}
