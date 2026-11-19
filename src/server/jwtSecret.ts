import { createHmac, randomBytes } from 'node:crypto';

/**
 * The key that signs admin login tokens. It must be identical in every server
 * instance: on Netlify each request can land on a different function instance,
 * so a per-instance random key makes a token from one instance fail on the next
 * ("Session expired or invalid"), after which the browser drops the token and
 * every save fails with "Authentication token required".
 *
 * 1. JWT_SECRET (32+ characters) when configured.
 * 2. Otherwise a key derived from MONGODB_URI, which every instance shares and
 *    which is already a private server variable.
 * 3. Otherwise (local development without MongoDB) a random key per process.
 */
export function resolveJwtSecret(environment: NodeJS.ProcessEnv = process.env): { secret: string; source: 'JWT_SECRET' | 'MONGODB_URI' | 'random' } {
  const configured = environment.JWT_SECRET?.trim();
  if (configured && configured.length >= 32) return { secret: configured, source: 'JWT_SECRET' };
  const mongoUri = environment.MONGODB_URI?.trim();
  if (mongoUri) {
    return { secret: createHmac('sha256', mongoUri).update('rashed-portfolio-admin-jwt-v1').digest('hex'), source: 'MONGODB_URI' };
  }
  const serverless = Boolean(environment.NETLIFY || environment.AWS_LAMBDA_FUNCTION_NAME || environment.VERCEL);
  if (environment.NODE_ENV === 'production' || serverless) {
    throw new Error('Set JWT_SECRET (at least 32 characters) so admin logins work across server instances.');
  }
  return { secret: randomBytes(32).toString('hex'), source: 'random' };
}
