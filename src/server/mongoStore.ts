import { BSON, MongoClient, type Collection } from 'mongodb';
import type { PortfolioData } from '../types';
import { publicationStats } from '../utils/publicationStats';

export const MONGO_COLLECTION = 'portfolio';
export const MONGO_DOCUMENT_ID = 'main';
export interface MongoSettings { uri: string; database: string }
type Snapshot = Omit<PortfolioData, 'adminConfig'>;
interface StoredPortfolio {
  _id: string;
  schemaVersion: number;
  data: Snapshot;
  versions: Record<string, number>;
  updatedAt: Date;
}

export class MongoStorageError extends Error {
  constructor(message: string, public readonly code: 'connection' | 'empty' | 'conflict' | 'exists' | 'invalid') {
    super(message);
    this.name = 'MongoStorageError';
  }
}

export function getMongoSettings(environment: NodeJS.ProcessEnv = process.env): MongoSettings | null {
  const uri = environment.MONGODB_URI?.trim();
  if (!uri) return null;
  if (!/^mongodb(?:\+srv)?:\/\//.test(uri)) throw new MongoStorageError('MONGODB_URI must be a MongoDB connection string.', 'invalid');
  const database = environment.MONGODB_DB?.trim() || 'rashed_portfolio';
  if (!/^[a-zA-Z0-9_-]{1,63}$/.test(database)) throw new MongoStorageError('MONGODB_DB must be a database name containing letters, numbers, underscores or hyphens.', 'invalid');
  return {uri, database};
}

// One small connection pool per warm Netlify function instance, not per request.
const connections = new Map<string, Promise<MongoClient>>();
async function mongoClient(settings: MongoSettings): Promise<MongoClient> {
  const key = settings.uri;
  let connection = connections.get(key);
  if (!connection) {
    const client = new MongoClient(settings.uri, {
      maxPoolSize: 5, minPoolSize: 0, maxIdleTimeMS: 60000,
      serverSelectionTimeoutMS: 8000, connectTimeoutMS: 8000, socketTimeoutMS: 15000,
      retryReads: true, retryWrites: true,
    });
    connection = client.connect().catch(async () => {
      connections.delete(key);
      await client.close().catch(() => {});
      throw new MongoStorageError('Cannot connect to MongoDB. Check MONGODB_URI, the database user and Atlas network access.', 'connection');
    });
    connections.set(key, connection);
  }
  return connection;
}

export async function closeMongoConnections() {
  const clients = await Promise.allSettled([...connections.values()]);
  connections.clear();
  await Promise.all(clients.filter(result => result.status === 'fulfilled').map(result => result.value.close()));
}

export function prepareMongoSnapshot(value: unknown): Snapshot {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new MongoStorageError('Import a full portfolio JSON export.', 'invalid');
  const {adminConfig: _credentials, ...copy} = JSON.parse(JSON.stringify(value)) as PortfolioData;
  if (!copy.profile || typeof copy.profile !== 'object' || typeof copy.profile.name !== 'string') throw new MongoStorageError('The portfolio export is missing a valid profile.', 'invalid');
  for (const key of ['publications', 'projects', 'experience', 'education', 'skillGroups'] as const) {
    if (!Array.isArray(copy[key])) throw new MongoStorageError(`The portfolio export is missing ${key}.`, 'invalid');
  }
  if (copy.messages !== undefined && !Array.isArray(copy.messages)) throw new MongoStorageError('Portfolio messages must be an array.', 'invalid');
  copy.messages ??= [];
  copy.profile.stats = {...copy.profile.stats, ...publicationStats(copy.publications)};
  if (BSON.calculateObjectSize({data: copy}) > 15 * 1024 * 1024) throw new MongoStorageError('Portfolio content is too large for one MongoDB document. Use external URLs for large images and files.', 'invalid');
  return copy;
}

export class MongoPortfolioStore {
  private versions: Record<string, number> | null = null;
  constructor(public readonly settings: MongoSettings) {}

  private async collection(): Promise<Collection<StoredPortfolio>> {
    const client = await mongoClient(this.settings);
    return client.db(this.settings.database).collection<StoredPortfolio>(MONGO_COLLECTION);
  }

  async read(): Promise<Snapshot> {
    try {
      const document = await (await this.collection()).findOne({_id: MONGO_DOCUMENT_ID});
      if (!document) throw new MongoStorageError('MongoDB is connected but empty. Run npm run db:migrate before starting the site.', 'empty');
      if (document.schemaVersion !== 1) throw new MongoStorageError('Unsupported MongoDB portfolio schema version.', 'invalid');
      const snapshot = prepareMongoSnapshot(document.data);
      this.versions = {...document.versions};
      return snapshot;
    } catch (error) {
      if (error instanceof MongoStorageError) throw error;
      throw new MongoStorageError('MongoDB read failed. Check database permissions and network access.', 'connection');
    }
  }

  async initialize(value: unknown): Promise<void> {
    const data = prepareMongoSnapshot(value);
    try {
      await (await this.collection()).insertOne({
        _id: MONGO_DOCUMENT_ID, schemaVersion: 1, data,
        versions: Object.fromEntries(Object.keys(data).map(key => [key, 0])), updatedAt: new Date(),
      }, {writeConcern: {w:'majority'}});
    } catch (error: any) {
      if (error?.code === 11000) throw new MongoStorageError('MongoDB already contains a portfolio. Migration did not overwrite it; use admin backup/import after reviewing the existing data.', 'exists');
      if (error instanceof MongoStorageError) throw error;
      throw new MongoStorageError('MongoDB initialization failed. Check database permissions and network access.', 'connection');
    }
  }

  async writeChanges(snapshot: PortfolioData, previous: PortfolioData): Promise<void> {
    if (!this.versions) throw new MongoStorageError('Read MongoDB before saving changes.', 'invalid');
    const data = prepareMongoSnapshot(snapshot);
    const changed = Object.keys(data).filter(key => JSON.stringify(data[key as keyof Snapshot]) !== JSON.stringify(previous[key as keyof PortfolioData]));
    if (!changed.length) return;
    const checks = changed.map(key => ({[`versions.${key}`]: this.versions![key] === undefined ? {$exists:false} : this.versions![key]}));
    const updates = Object.fromEntries(changed.map(key => [`data.${key}`, data[key as keyof Snapshot]]));
    const increments = Object.fromEntries(changed.map(key => [`versions.${key}`, 1]));
    try {
      const result = await (await this.collection()).updateOne(
        {_id:MONGO_DOCUMENT_ID, $and:checks},
        {$set:{...updates, updatedAt:new Date()}, $inc:increments},
        {writeConcern:{w:'majority'}},
      );
      if (result.matchedCount !== 1) throw new MongoStorageError('This section was changed in another tab. Refresh and try again; your save did not overwrite it.', 'conflict');
      for (const key of changed) this.versions[key] = (this.versions[key] ?? 0) + 1;
    } catch (error) {
      if (error instanceof MongoStorageError) throw error;
      throw new MongoStorageError('MongoDB could not save the change. No local fallback was used.', 'connection');
    }
  }
}

export function createMongoStore(): MongoPortfolioStore | null {
  const settings = getMongoSettings();
  return settings ? new MongoPortfolioStore(settings) : null;
}
