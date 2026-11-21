import { defaultPorts } from '../../../scripts/DevServers.ts';

const sitePort = Number(process.env.ENVUI_SITE_PORT || defaultPorts.site);
const siteBuildPort = Number(process.env.ENVUI_SITE_BUILD_PORT || defaultPorts.siteBuild);
const fixturePort = Number(process.env.ENVUI_FIXTURE_PORT || defaultPorts.fixture);
export const siteDevUrl = `http://127.0.0.1:${sitePort}`;
export const siteBuildUrl = `http://127.0.0.1:${siteBuildPort}`;
export const fixtureUrl = `http://127.0.0.1:${fixturePort}`;
