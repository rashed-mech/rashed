import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'dotenv';

export function readAdminCredentials(directory = process.cwd(), environment: NodeJS.ProcessEnv = process.env) {
  let username = (environment.ADMIN_USERNAME || environment.ADMIN_USER || '').trim();
  let password = environment.ADMIN_PASSWORD || environment.ADMIN_PASS || '';
  const sources = { username: 'Server environment', password: 'Server environment' };
  // Deployed hosts use private server variables. Local files override defaults
  // in development and are parsed with exactly the same rules as dotenv.
  if (environment.NODE_ENV !== 'production') {
    for (const file of ['.env', '.env.local']) {
      const filename = path.resolve(directory, file);
      if (!fs.existsSync(filename)) continue;
      const values = parse(fs.readFileSync(filename));
      const user = values.ADMIN_USERNAME ?? values.ADMIN_USER;
      const secret = values.ADMIN_PASSWORD ?? values.ADMIN_PASS;
      if (user !== undefined) { username = user.trim(); sources.username = file; }
      if (secret !== undefined) { password = secret; sources.password = file; }
    }
  }
  return { username, password, sources };
}

/** Quote values without changing passwords containing #, spaces or quotes. */
export function writeLocalAdminCredentials(username: string, password?: string, directory = process.cwd()) {
  const filename = path.resolve(directory, '.env.local');
  let content = fs.existsSync(filename) ? fs.readFileSync(filename, 'utf8') : '';
  const encode = (value: string) => {
    if (/[\r\n]/.test(value)) throw new Error('Credentials must be a single line.');
    const quote = ["'", '"', '`'].find(character => !value.includes(character));
    if (!quote) throw new Error('The credential must not contain all three quote styles.');
    const encoded = `${quote}${value}${quote}`;
    if (parse(`VALUE=${encoded}`).VALUE !== value) throw new Error('The credential cannot be represented safely in .env.local.');
    return encoded;
  };
  for (const [key, value] of Object.entries({ADMIN_USERNAME: username.trim(), ...(password !== undefined ? {ADMIN_PASSWORD:password} : {})})) {
    const line = `${key}=${encode(value)}`;
    const expression = new RegExp(`^\\s*(?:export\\s+)?${key}\\s*=.*$`, 'm');
    content = expression.test(content) ? content.replace(expression, () => line) : `${content.trimEnd()}\n${line}\n`;
  }
  fs.writeFileSync(filename, content.trimStart().trimEnd() + '\n', 'utf8');
}
