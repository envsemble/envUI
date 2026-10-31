#!/usr/bin/env node
// envui-graphic: trims a picture's empty edges once, when it joins an application, and prints the
// Graphic to show it with. The work is in trimGraphic.js.
//
//   npx envui-graphic <file>... [--out <dir>]

import { main } from './trimGraphic.js';

process.exitCode = await main(process.argv.slice(2));
