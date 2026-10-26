import dotenv from 'dotenv';
import path from 'path';

// Hosted production uses its private environment settings. Development loads
// .env defaults followed by the local overrides in .env.local.
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.resolve(process.cwd(), '.env') });
  dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), override: true });
}
