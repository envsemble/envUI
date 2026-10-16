/// <reference types="vite/client" />

/** The release tag or commit that links to envUI's source files point at; see vite.config.ts. */
declare const __ENVUI_SOURCE_REVISION__: string;

/**
 * Whether routes live in the address's path, as in the hosted catalogue and in development, rather
 * than in its hash, as in the offline catalogue; see vite.config.ts.
 */
declare const __ENVUI_PATH_ROUTES__: boolean;
