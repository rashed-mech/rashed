import fs from 'node:fs';
import { build } from 'esbuild';

// This project uses type:module. The Lambda entry is explicitly CommonJS.
// Remove the previous generated .js entry so Netlify cannot deploy it twice.
fs.rmSync('netlify/functions/api.js', {force:true});
await build({
  entryPoints:['api-src/handler-netlify.ts'], bundle:true, platform:'node',
  format:'cjs', target:'node20', packages:'external', outfile:'netlify/functions/api.cjs',
});
