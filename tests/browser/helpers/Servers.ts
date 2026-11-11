import { defaultPorts } from '../../../scripts/test/CheckoutMarker.ts';

/**
 * Servers the browser suite starts or reuses. playwright.config.ts picks the ports before any spec
 * loads: the default ports (defaultPorts in scripts/test/CheckoutMarker.ts), unless another
 * checkout or program holds them, when this checkout takes ports of its own. To choose them, set
 * ENVUI_SITE_PORT, ENVUI_SITE_BUILD_PORT and ENVUI_FIXTURE_PORT, for example to 8832, 8834 and
 * 8833.
 *
 * - siteBuildUrl: the site, both its parts, built as it is hosted (scripts/test/ServeBuild.ts).
 *   A spec of the site uses it, unless it needs the development server.
 * - siteDevUrl: the site on Vite's development server, for what only it has, such as the modules
 *   of the site's source at their own paths and asking for a module again after it failed.
 * - fixtureUrl: the library's fixture (tests/fixture), a development build.
 */
const sitePort = Number(process.env.ENVUI_SITE_PORT || defaultPorts.site);
const siteBuildPort = Number(process.env.ENVUI_SITE_BUILD_PORT || defaultPorts.siteBuild);
const fixturePort = Number(process.env.ENVUI_FIXTURE_PORT || defaultPorts.fixture);
export const siteDevUrl = `http://127.0.0.1:${sitePort}`;
export const siteBuildUrl = `http://127.0.0.1:${siteBuildPort}`;
export const fixtureUrl = `http://127.0.0.1:${fixturePort}`;
