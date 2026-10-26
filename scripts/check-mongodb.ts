import '../load-env.ts';
import { createMongoStore, closeMongoConnections } from '../src/server/mongoStore';

try {
  const store = createMongoStore();
  if (!store) throw new Error('Set MONGODB_URI and MONGODB_DB in .env.local.');
  const data = await store.read();
  console.log(`MongoDB verified: ${store.settings.database}.portfolio / main.`);
  console.log(`Saved content: ${data.publications.length} publications, ${data.projects.length} projects, ${data.messages.length} messages.`);
} catch (error: any) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await closeMongoConnections();
}
