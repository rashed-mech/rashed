import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import config from '../../firebase-applet-config.json';

/** Server credentials only. Never expose this module to the Vite client bundle. */
export function getSecureFirestore() {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const useDefaultCredentials = !!process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.FIREBASE_USE_APPLICATION_DEFAULT_CREDENTIALS === 'true';
  if (!json && !useDefaultCredentials) return null;

  const app = getApps().find(candidate => candidate.name === 'portfolio-server') || initializeApp({
    credential: json ? cert(JSON.parse(json)) : applicationDefault(),
    projectId: config.projectId
  }, 'portfolio-server');
  return getFirestore(app, config.firestoreDatabaseId || '(default)');
}
