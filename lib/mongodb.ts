import mongoose from 'mongoose';
import dns from 'dns';

// Setup DNS fallback for Windows / local ISPs
function setupDns() {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
  } catch {
    // Ignore if not supported in runtime
  }
}
setupDns();

const MONGODB_URI = process.env.MONGODB_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

async function resolveDirectUri(srvUri: string): Promise<string> {
  if (!srvUri.startsWith('mongodb+srv://')) return srvUri;

  try {
    const raw = srvUri.replace('mongodb+srv://', 'http://');
    const parsed = new URL(raw);
    const auth = parsed.username ? `${parsed.username}:${parsed.password}@` : '';
    const host = parsed.hostname;
    const dbAndQuery = parsed.pathname + parsed.search;

    const resolver = new dns.promises.Resolver();
    resolver.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);

    const srvRecords = await resolver.resolveSrv(`_mongodb._tcp.${host}`);
    const txtRecords = await resolver.resolveTxt(host).catch(() => []);

    const hosts = srvRecords.map((r) => `${r.name}:${r.port}`).join(',');
    const txtParams = txtRecords.flat().join('&');

    const sep = dbAndQuery.includes('?') ? '&' : '?';
    const finalParams = txtParams ? `${sep}ssl=true&${txtParams}` : `${sep}ssl=true`;

    return `mongodb://${auth}${hosts}${dbAndQuery}${finalParams}`;
  } catch (err) {
    console.error('[MongoDB] Failed resolving fallback URI:', err);
    return srvUri;
  }
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env');
  }

  setupDns();

  if (cached && cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached!.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
    };

    cached!.promise = (async () => {
      try {
        return await mongoose.connect(MONGODB_URI, opts);
      } catch (err: any) {
        if (
          err?.message?.includes('querySrv') ||
          err?.message?.includes('ECONNREFUSED') ||
          err?.message?.includes('ENOTFOUND')
        ) {
          console.warn('[MongoDB] SRV lookup failed, switching to direct replica set...');
          const fallbackUri = await resolveDirectUri(MONGODB_URI);
          if (fallbackUri !== MONGODB_URI) {
            return await mongoose.connect(fallbackUri, opts);
          }
        }
        throw err;
      }
    })();
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (e) {
    cached!.promise = null;
    cached!.conn = null;
    throw e;
  }

  return cached!.conn;
}


