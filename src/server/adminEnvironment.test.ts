import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { readAdminCredentials, writeLocalAdminCredentials } from './adminEnvironment';

test('local admin credentials follow dotenv precedence, reload edits, and preserve password characters', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-auth-test-'));
  const defaults = path.join(directory, '.env');
  const local = path.join(directory, '.env.local');
  try {
    fs.writeFileSync(defaults, 'ADMIN_USERNAME=default-user\nADMIN_PASSWORD=default-password\n');
    fs.writeFileSync(local, 'PORT=4000\nexport ADMIN_USERNAME="local-user" # comment\nADMIN_PASSWORD="secret # with spaces"\n');
    const environment = {NODE_ENV:'development', ADMIN_USERNAME:'process-user', ADMIN_PASSWORD:'process-password'};
    const first = readAdminCredentials(directory, environment);
    assert.equal(first.username, 'local-user');
    assert.equal(first.password, 'secret # with spaces');
    assert.deepEqual(first.sources, {username:'.env.local', password:'.env.local'});
    fs.writeFileSync(local, 'PORT=4000\nADMIN_USER=alias-user\nADMIN_PASS=changed-password # comment\n');
    assert.equal(readAdminCredentials(directory, environment).username, 'alias-user');
    assert.equal(readAdminCredentials(directory, environment).password, 'changed-password');
    writeLocalAdminCredentials('updated-user', `secret's # "quoted" value`, directory);
    assert.equal(readAdminCredentials(directory, environment).username, 'updated-user');
    assert.equal(readAdminCredentials(directory, environment).password, `secret's # "quoted" value`);
    assert.match(fs.readFileSync(local, 'utf8'), /^PORT=4000$/m);
    writeLocalAdminCredentials('username-only', undefined, directory);
    assert.equal(readAdminCredentials(directory, environment).password, `secret's # "quoted" value`);
    const production = readAdminCredentials(directory, {...environment, NODE_ENV:'production'});
    assert.equal(production.username, 'process-user');
    assert.equal(production.password, 'process-password');
    assert.equal(production.sources.username, 'Server environment');
  } finally {
    fs.unlinkSync(defaults);
    fs.unlinkSync(local);
    fs.rmdirSync(directory);
  }
});
