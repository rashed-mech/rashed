import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoPortfolioStore, closeMongoConnections, getMongoSettings, prepareMongoSnapshot } from './mongoStore';
import seed from '../../data/portfolio_db.json';

test('MongoDB configuration and migration validation do not expose or store admin credentials', () => {
  assert.equal(getMongoSettings({}), null);
  assert.throws(() => getMongoSettings({MONGODB_URI:'https://invalid'}), /connection string/);
  assert.throws(() => getMongoSettings({MONGODB_URI:'mongodb://localhost', MONGODB_DB:'invalid/name'}), /database name/);
  assert.equal(getMongoSettings({MONGODB_URI:'mongodb://localhost'})?.database, 'rashed_portfolio');
  assert.throws(() => prepareMongoSnapshot({}), /profile/);
  const input = {...structuredClone(seed), adminConfig:{username:'legacy',password:'not-for-mongodb'}};
  const saved = prepareMongoSnapshot(input);
  assert.equal('adminConfig' in saved, false);
  assert.ok('adminConfig' in input, 'Migration must not mutate the source');
});

test('MongoDB persists content, refuses destructive migration, and protects concurrent section edits', {timeout:180000}, async () => {
  const originalMode = process.env.NODE_ENV;
  const originalUri = process.env.MONGODB_URI;
  // Never connect to an actual user's Atlas database from the test suite.
  delete process.env.MONGODB_URI;
  process.env.NODE_ENV = 'development';
  const cachedWindowsBinary = path.resolve('.verification/mongodb-binaries/mongod-x64-win32-8.2.6.exe');
  const server = await MongoMemoryServer.create({
    instance:{ip:'127.0.0.1'}, binary:{
      version:'8.2.6', downloadDir:path.resolve('.verification/mongodb-binaries'),
      // Reuse the checksum-verified executable if it has already been prepared.
      systemBinary: process.platform === 'win32' && fs.existsSync(cachedWindowsBinary) ? cachedWindowsBinary : undefined,
    },
  });
  const settings = {uri:server.getUri(), database:'portfolio_integration_test'};
  const store = new MongoPortfolioStore(settings);
  const localFile = path.resolve('.verification/mongo-should-not-write-local.json');
  try {
    await assert.rejects(store.read(), /db:migrate/);
    await store.initialize(structuredClone(seed));
    const migrated = await store.read();
    assert.deepEqual(migrated, prepareMongoSnapshot(seed));
    await assert.rejects(store.initialize({...seed, profile:{...seed.profile,name:'Would overwrite'}}), /did not overwrite/);
    assert.equal((await store.read()).profile.name, seed.profile.name);
    const { PortfolioDatabase } = await import('./db');
    const first = new PortfolioDatabase(localFile, new MongoPortfolioStore(settings));
    const second = new PortfolioDatabase(localFile, new MongoPortfolioStore(settings));
    await Promise.all([first.waitUntilReady(), second.waitUntilReady()]);
    assert.equal(first.getStorageInfo().type, 'mongodb');
    assert.equal(first.getStorageDetails().location, `${settings.database}.portfolio / document main`);
    first.updateProfile({headline:'Persisted in MongoDB'});
    await first.flush();
    second.updateProject(second.getFullData().projects[0].id, {title:'Separate section edit'});
    await second.flush();
    await first.refresh();
    assert.equal(first.getPublicData().profile.headline, 'Persisted in MongoDB');
    assert.equal(first.getPublicData().projects[0].title, 'Separate section edit');
    first.addMessage({name:'Visitor',email:'visitor@example.invalid',subject:'Private',message:'Keep this private'});
    await first.flush();
    assert.equal('messages' in first.getPublicData(), false);
    const fresh = new PortfolioDatabase(localFile, new MongoPortfolioStore(settings));
    const stale = new PortfolioDatabase(localFile, new MongoPortfolioStore(settings));
    await Promise.all([fresh.waitUntilReady(), stale.waitUntilReady()]);
    assert.equal(fresh.getFullData().messages.at(-1)?.message, 'Keep this private');
    fresh.updateProfile({headline:'Winning edit'});
    await fresh.flush();
    stale.updateProfile({headline:'Stale edit'});
    await assert.rejects(stale.flush(), /another tab/);
    assert.equal(stale.getFullData().profile.headline, 'Persisted in MongoDB', 'Failed writes restore the last loaded snapshot');
    await stale.refresh();
    assert.equal(stale.getFullData().profile.headline, 'Winning edit');
    assert.equal(fs.existsSync(localFile), false, 'MongoDB saves must not write to local JSON');
    await server.stop();
    fresh.updateProfile({headline:'Unavailable database edit'});
    await assert.rejects(fresh.flush(), /MongoDB/);
    assert.equal(fresh.getFullData().profile.headline, 'Winning edit');
    assert.equal(fs.existsSync(localFile), false, 'Database outages must not silently switch to a local file');
  } finally {
    await closeMongoConnections();
    await server.stop();
    if (originalMode === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = originalMode;
    if (originalUri === undefined) delete process.env.MONGODB_URI; else process.env.MONGODB_URI = originalUri;
  }
});
