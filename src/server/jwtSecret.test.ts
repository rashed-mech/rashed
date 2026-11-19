import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { resolveJwtSecret } from './jwtSecret';

test('admin tokens verify on every serverless instance', () => {
  const env = { MONGODB_URI: 'mongodb+srv://user:pass@cluster.example.net/', NETLIFY: 'true' } as NodeJS.ProcessEnv;
  // Two cold starts of the Netlify function resolve the key independently.
  const first = resolveJwtSecret(env);
  const second = resolveJwtSecret(env);
  assert.equal(first.source, 'MONGODB_URI');
  const token = jwt.sign({ username: 'admin' }, first.secret);
  assert.equal((jwt.verify(token, second.secret) as any).username, 'admin');
  assert.notEqual(first.secret, env.MONGODB_URI, 'The connection string itself is never the signing key');
});

test('a configured JWT_SECRET wins and short secrets are not used', () => {
  const long = 'x'.repeat(40);
  assert.deepEqual(resolveJwtSecret({ JWT_SECRET: long, MONGODB_URI: 'mongodb://a' } as NodeJS.ProcessEnv), { secret: long, source: 'JWT_SECRET' });
  assert.equal(resolveJwtSecret({ JWT_SECRET: 'short', MONGODB_URI: 'mongodb://a' } as NodeJS.ProcessEnv).source, 'MONGODB_URI');
});

test('serverless without any shared key refuses to start instead of issuing tokens that fail', () => {
  assert.throws(() => resolveJwtSecret({ NETLIFY: 'true' } as NodeJS.ProcessEnv), /JWT_SECRET/);
  assert.equal(resolveJwtSecret({} as NodeJS.ProcessEnv).source, 'random');
});
