/**
 * Servers the browser suite starts or reuses. playwright.config.ts picks the ports before any spec
 * loads: 8770 for the catalogue and 8766 for the fixture, unless another checkout or program holds
 * them, when this checkout takes ports of its own (scripts/CheckoutMarker.mjs). To choose them,
 * set ENVUI_CATALOGUE_PORT and ENVUI_FIXTURE_PORT, for example to 8832 and 8833.
 */
export const cataloguePort = Number(process.env.ENVUI_CATALOGUE_PORT || 8770);
export const fixturePort = Number(process.env.ENVUI_FIXTURE_PORT || 8766);
export const catalogueUrl = `http://127.0.0.1:${cataloguePort}`;
export const fixtureUrl = `http://127.0.0.1:${fixturePort}`;
