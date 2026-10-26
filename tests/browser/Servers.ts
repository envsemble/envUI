/**
 * Servers the browser suite starts or reuses. playwright.config.ts picks the ports before any spec
 * loads: 8770 for the site in development, both its parts, and 8766 for the fixture, unless another
 * checkout or program holds them, when this checkout takes ports of its own
 * (scripts/test/CheckoutMarker.ts). To choose them, set ENVUI_SITE_PORT and ENVUI_FIXTURE_PORT, for
 * example to 8832 and 8833; ENVUI_CATALOGUE_PORT, the site's port's name before, still counts.
 */
export const sitePort = Number(
  process.env.ENVUI_SITE_PORT || process.env.ENVUI_CATALOGUE_PORT || 8770,
);
export const fixturePort = Number(process.env.ENVUI_FIXTURE_PORT || 8766);
export const siteDevUrl = `http://127.0.0.1:${sitePort}`;
export const fixtureUrl = `http://127.0.0.1:${fixturePort}`;
