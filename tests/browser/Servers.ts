/**
 * Servers the browser suite starts or reuses. Override the ports to run the suite beside another
 * checkout's servers, for example ENVUI_CATALOGUE_PORT=8772 ENVUI_FIXTURE_PORT=8767.
 */
export const cataloguePort = Number(process.env.ENVUI_CATALOGUE_PORT || 8770);
export const fixturePort = Number(process.env.ENVUI_FIXTURE_PORT || 8766);
export const catalogueUrl = `http://127.0.0.1:${cataloguePort}`;
export const fixtureUrl = `http://127.0.0.1:${fixturePort}`;
