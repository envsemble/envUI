import { defaultPorts } from '../../../scripts/test/CheckoutMarker.ts';

/**
 * Servers the browser suite starts or reuses. playwright.config.ts picks the ports before any spec
 * loads: the default ports (defaultPorts in scripts/test/CheckoutMarker.ts) for the site in
 * development, both its parts, and for the fixture, unless another checkout or program holds them,
 * when this checkout takes ports of its own. To choose them, set ENVUI_SITE_PORT and ENVUI_FIXTURE_PORT, for
 * example to 8832 and 8833; ENVUI_CATALOGUE_PORT, the site's port's name before, still counts.
 */
export const sitePort = Number(
  process.env.ENVUI_SITE_PORT || process.env.ENVUI_CATALOGUE_PORT || defaultPorts.site,
);
export const fixturePort = Number(process.env.ENVUI_FIXTURE_PORT || defaultPorts.fixture);
export const siteDevUrl = `http://127.0.0.1:${sitePort}`;
export const fixtureUrl = `http://127.0.0.1:${fixturePort}`;
