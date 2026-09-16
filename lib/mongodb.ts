import mongoose, { Connection } from 'mongoose';
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

export interface ClusterConfig {
  id: 1 | 2 | 3 | 4;
  key: string;
  name: string;
  role: string;
  envVarNames: string[];
  isOptional: boolean;
}

export const CLUSTER_DEFINITIONS: ClusterConfig[] = [
  {
    id: 1,
    key: 'system',
    name: 'MongoDB 1: Master System & Config',
    role: 'Kredensial Admin, Multi-API Key (1-Bot Lock), Daftar Domain & Statistik',
    envVarNames: ['MONGODB_URI_SYSTEM', 'MONGODB_URI_1', 'MONGODB_URI'],
    isOptional: false,
  },
  {
    id: 2,
    key: 'primary',
    name: 'MongoDB 2: Primary Message Inbox',
    role: 'Penyimpanan Pesan Email Utama, Ekstraksi OTP & Link (Auto-Delete 3 Hari)',
    envVarNames: ['MONGODB_URI_PRIMARY', 'MONGODB_URI_2', 'MONGODB_URI'],
    isOptional: false,
  },
  {
    id: 3,
    key: 'secondary',
    name: 'MongoDB 3: Secondary / Failover 1 Inbox',
    role: 'Cadangan Otomatis Lapis 1 (Failover Inbox saat DB 2 Penuh / Gangguan)',
    envVarNames: ['MONGODB_URI_SECONDARY', 'MONGODB_URI_FAILOVER_1', 'MONGODB_URI_3'],
    isOptional: false,
  },
  {
    id: 4,
    key: 'standby',
    name: 'MongoDB 4: Standby Backup / Failover 2 Inbox',
    role: 'Cadangan Darurat Lapis 2 (Opsional - Ekstra Redundansi & Kapasitas)',
    envVarNames: ['MONGODB_URI_STANDBY', 'MONGODB_URI_FAILOVER_2', 'MONGODB_URI_4'],
    isOptional: true,
  },
];

/**
 * Resolve URI for given cluster definition
 */
export function getClusterUri(cluster: ClusterConfig): string | null {
  for (const envName of cluster.envVarNames) {
    const val = process.env[envName]?.trim();
    if (val) return val;
  }
  return null;
}

interface ConnectionCacheItem {
  conn: Connection | null;
  promise: Promise<Connection> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseClusterPool: Record<string, ConnectionCacheItem> | undefined;
  // eslint-disable-next-line no-var
  var mongooseDefaultCache: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined;
}

if (!global.mongooseClusterPool) {
  global.mongooseClusterPool = {};
}
if (!global.mongooseDefaultCache) {
  global.mongooseDefaultCache = { conn: null, promise: null };
}

async function resolveDirectUri(srvUri: string): Promise<string> {
  if (!srvUri || !srvUri.startsWith('mongodb+srv://')) return srvUri;

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

/**
 * Connect to a specific MongoDB URI using Mongoose createConnection pool
 */
export async function getOrCreateClusterConnection(uri: string, clusterKey: string): Promise<Connection> {
  setupDns();

  const pool = global.mongooseClusterPool!;
  if (pool[uri] && pool[uri].conn && pool[uri].conn!.readyState === 1) {
    return pool[uri].conn!;
  }

  if (!pool[uri] || !pool[uri].promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 8000,
    };

    pool[uri] = {
      conn: null,
      promise: (async () => {
        try {
          const conn = mongoose.createConnection(uri, opts);
          return await conn.asPromise();
        } catch (err: any) {
          if (
            err?.message?.includes('querySrv') ||
            err?.message?.includes('ECONNREFUSED') ||
            err?.message?.includes('ENOTFOUND')
          ) {
            console.warn(`[MongoDB ${clusterKey}] SRV lookup failed, switching to direct replica set...`);
            const fallbackUri = await resolveDirectUri(uri);
            if (fallbackUri !== uri) {
              const fallbackConn = mongoose.createConnection(fallbackUri, opts);
              return await fallbackConn.asPromise();
            }
          }
          throw err;
        }
      })(),
    };
  }

  try {
    const conn = await pool[uri].promise;
    if (!conn) {
      throw new Error(`Gagal membuka koneksi ke cluster ${clusterKey}`);
    }
    pool[uri].conn = conn;
    return conn;
  } catch (e) {
    delete pool[uri];
    throw e;
  }
}

/**
 * Get Connection for Cluster 1: System Master (Auth, Settings, API Keys, Domains)
 */
export async function getSystemConnection(): Promise<Connection> {
  const sysConfig = CLUSTER_DEFINITIONS[0];
  const uri = getClusterUri(sysConfig) || process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('Konfigurasi MONGODB_URI_SYSTEM atau MONGODB_URI wajib diisi di environment variables (.env / Vercel).');
  }
  return await getOrCreateClusterConnection(uri, 'System');
}

export interface ActiveMessageCluster {
  id: number;
  key: string;
  name: string;
  uri: string;
  connection: Connection;
  isPrimary: boolean;
}

/**
 * Get all active message connections (Cluster 2 Primary, Cluster 3 Secondary, Cluster 4 Standby Optional)
 */
export async function getMessageConnections(): Promise<ActiveMessageCluster[]> {
  const activeClusters: ActiveMessageCluster[] = [];

  // Check definitions for message stores: ID 2, 3, 4
  const messageDefs = CLUSTER_DEFINITIONS.slice(1);

  for (const def of messageDefs) {
    const uri = getClusterUri(def);
    if (uri) {
      try {
        const connection = await getOrCreateClusterConnection(uri, def.name);
        if (connection && connection.readyState === 1) {
          activeClusters.push({
            id: def.id,
            key: def.key,
            name: def.name,
            uri: uri,
            connection: connection,
            isPrimary: def.id === 2,
          });
        }
      } catch (err) {
        console.warn(`[MongoDB] Gagal menghubungkan ke ${def.name}:`, err);
      }
    }
  }

  // Fallback: If no dedicated message cluster connected, fallback to System DB / Default MONGODB_URI
  if (activeClusters.length === 0) {
    const sysConn = await getSystemConnection();
    const fallbackUri = getClusterUri(CLUSTER_DEFINITIONS[0]) || process.env.MONGODB_URI || 'default';
    activeClusters.push({
      id: 1,
      key: 'system_fallback',
      name: 'MongoDB 1 (Single Node Fallback)',
      uri: fallbackUri,
      connection: sysConn,
      isPrimary: true,
    });
  }

  return activeClusters;
}

/**
 * Health check diagnostics for all 4 MongoDB Clusters
 */
export async function getClusterHealth() {
  const results = [];

  for (const def of CLUSTER_DEFINITIONS) {
    const uri = getClusterUri(def);
    if (!uri) {
      results.push({
        id: def.id,
        key: def.key,
        name: def.name,
        role: def.role,
        isOptional: def.isOptional,
        configured: false,
        status: def.isOptional ? 'optional_unconfigured' : 'unconfigured',
        latencyMs: null,
        error: null,
      });
      continue;
    }

    const start = Date.now();
    try {
      const conn = await getOrCreateClusterConnection(uri, def.name);
      const latencyMs = Date.now() - start;
      const isReady = conn.readyState === 1;

      // Mask URI for security
      const maskedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');

      results.push({
        id: def.id,
        key: def.key,
        name: def.name,
        role: def.role,
        isOptional: def.isOptional,
        configured: true,
        maskedUri: maskedUri,
        status: isReady ? 'connected' : 'connecting',
        latencyMs: latencyMs,
        error: null,
      });
    } catch (err: any) {
      results.push({
        id: def.id,
        key: def.key,
        name: def.name,
        role: def.role,
        isOptional: def.isOptional,
        configured: true,
        status: 'error',
        latencyMs: null,
        error: err.message || 'Gagal terhubung ke cluster',
      });
    }
  }

  return results;
}

/**
 * Backward-compatible single-connection helper
 */
export async function connectToDatabase(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI_SYSTEM || process.env.MONGODB_URI_1 || process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env / Vercel');
  }

  setupDns();

  const cached = global.mongooseDefaultCache!;
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
    };

    cached.promise = (async () => {
      try {
        return await mongoose.connect(uri, opts);
      } catch (err: any) {
        if (
          err?.message?.includes('querySrv') ||
          err?.message?.includes('ECONNREFUSED') ||
          err?.message?.includes('ENOTFOUND')
        ) {
          console.warn('[MongoDB] SRV lookup failed, switching to direct replica set...');
          const fallbackUri = await resolveDirectUri(uri);
          if (fallbackUri !== uri) {
            return await mongoose.connect(fallbackUri, opts);
          }
        }
        throw err;
      }
    })();
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    cached.conn = null;
    throw e;
  }

  return cached.conn;
}


