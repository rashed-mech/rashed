import '../load-env.ts';
import fs from 'node:fs';
import path from 'node:path';
import { isDeepStrictEqual } from 'node:util';
import { createMongoStore, closeMongoConnections, prepareMongoSnapshot, MONGO_COLLECTION, MONGO_DOCUMENT_ID } from '../src/server/mongoStore';

const arguments_ = process.argv.slice(2);
const from = arguments_.indexOf('--from');
const filename = from >= 0 ? arguments_[from + 1] : 'data/portfolio.local.json';
try {
  if (!filename) throw new Error('Provide a JSON filename after --from.');
  const source = path.resolve(filename);
  if (!fs.existsSync(source)) throw new Error('The source JSON does not exist. Export current admin data and pass its filename with --from.');
  const store = createMongoStore();
  if (!store) throw new Error('Set MONGODB_URI and MONGODB_DB in .env.local before migrating.');
  const data = prepareMongoSnapshot(JSON.parse(fs.readFileSync(source, 'utf8')));
  // insertOne refuses to replace an existing portfolio. Never empty the source.
  await store.initialize(data);
  const saved = await store.read();
  if (!isDeepStrictEqual(saved, data)) throw new Error('MongoDB verification did not match the source. Keep the original JSON backup.');
  console.log(`Verified migration: ${store.settings.database}.${MONGO_COLLECTION}, document ${MONGO_DOCUMENT_ID}.`);
  console.log(`Copied ${data.publications.length} publications, ${data.projects.length} projects and ${data.messages.length} messages. The source JSON was not changed.`);
} catch (error: any) {
  console.error(error.name === 'SyntaxError' ? 'The source file is not valid JSON.' : error.message);
  process.exitCode = 1;
} finally {
  await closeMongoConnections();
}
