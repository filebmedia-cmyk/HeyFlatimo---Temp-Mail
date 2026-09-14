import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { connectToDatabase } from '@/lib/mongodb';
import { Setting } from '@/lib/models/Setting';

const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  process.env.ADMIN_API_KEY ||
  'hfl_secure_jwt_session_secret_99887766554433221100';

const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 Hours Session

/**
 * Constant-time string comparison to prevent timing attacks
 */
export function safeCompare(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    // Constant time dummy compare to prevent length leakage
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Hash password with PBKDF2 (SHA-512 with 10,000 iterations and 16-byte random salt)
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `pbkdf2$${salt}$${hash}`;
}

/**
 * Verify password against stored hash or fallback to legacy plaintext
 */
export function verifyPassword(inputPassword: string, storedValue: string): boolean {
  if (!storedValue || !inputPassword) return false;

  if (storedValue.startsWith('pbkdf2$')) {
    const parts = storedValue.split('$');
    if (parts.length === 3) {
      const salt = parts[1];
      const originalHash = parts[2];
      const testHash = crypto.pbkdf2Sync(inputPassword, salt, 10000, 64, 'sha512').toString('hex');
      return safeCompare(testHash, originalHash);
    }
  }

  // Fallback for legacy plaintext password
  return safeCompare(inputPassword, storedValue);
}

/**
 * Generate HMAC-SHA256 signed Session Token for Admin
 */
export function createAdminSessionToken(username: string): string {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = Buffer.from(JSON.stringify({ u: username, exp: expiresAt })).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payload)
    .digest('base64url');
  return `${payload}.${signature}`;
}

/**
 * Verify HMAC-SHA256 signed Session Token
 */
export function verifyAdminSessionToken(token: string): { valid: boolean; username?: string } {
  if (!token || typeof token !== 'string') return { valid: false };

  const parts = token.split('.');
  if (parts.length !== 2) return { valid: false };

  const [payloadB64, signature] = parts;
  const expectedSig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payloadB64)
    .digest('base64url');

  if (!safeCompare(signature, expectedSig)) {
    return { valid: false };
  }

  try {
    const jsonStr = Buffer.from(payloadB64, 'base64url').toString('utf-8');
    const parsed = JSON.parse(jsonStr);

    if (Date.now() > parsed.exp) {
      return { valid: false }; // Token expired
    }

    return { valid: true, username: parsed.u };
  } catch {
    return { valid: false };
  }
}

/**
 * Get current active API Key for Bot integration
 */
export async function getCurrentApiKey(): Promise<string> {
  const envKey = process.env.ADMIN_API_KEY || 'hfl_key_8899aabbccddeeff00112233';
  try {
    await connectToDatabase();
    const setting = await Setting.findOne({ key: 'admin_api_key' }).lean();
    if (setting && (setting as any).value) {
      return (setting as any).value;
    }
  } catch (err) {
    // Fallback to env key if DB is offline
  }
  return envKey;
}

/**
 * Validate Bot API Key from Request (Headers, Bearer Token, or Query)
 */
export async function validateApiKey(req: NextRequest): Promise<boolean> {
  let providedKey: string | null = null;

  // 1. Cek header x-api-key
  const headerKey = req.headers.get('x-api-key');
  if (headerKey) {
    providedKey = headerKey.trim();
  }

  // 2. Cek Authorization Bearer
  if (!providedKey) {
    const authHeader = req.headers.get('authorization');
    if (authHeader) {
      providedKey = authHeader.replace(/^Bearer\s+/i, '').trim();
    }
  }

  // 3. Cek query parameter ?api_key=...
  if (!providedKey) {
    const { searchParams } = new URL(req.url);
    const queryKey = searchParams.get('api_key');
    if (queryKey) {
      providedKey = queryKey.trim();
    }
  }

  if (!providedKey) {
    return false;
  }

  const activeKey = await getCurrentApiKey();
  const envKey = process.env.ADMIN_API_KEY || 'hfl_key_8899aabbccddeeff00112233';

  return safeCompare(providedKey, activeKey) || safeCompare(providedKey, envKey);
}

export interface AdminCredentials {
  username: string;
  passwordHash: string;
}

export async function getAdminCredentials(): Promise<{ username: string; passwordRawOrHash: string }> {
  const defaultUser = process.env.ADMIN_USERNAME || 'HeyFlatimo';
  const defaultPass = process.env.ADMIN_PASSWORD || 'TmailFlatimo';

  try {
    await connectToDatabase();
    const setting = await Setting.findOne({ key: 'admin_credentials' }).lean();
    if (setting && (setting as any).value) {
      const parsed = JSON.parse((setting as any).value);
      return {
        username: parsed.username || defaultUser,
        passwordRawOrHash: parsed.password || defaultPass,
      };
    }
  } catch (err) {
    console.error('Error fetching admin credentials:', err);
  }

  return { username: defaultUser, passwordRawOrHash: defaultPass };
}

export async function saveAdminCredentials(username: string, passwordPlain: string): Promise<{ username: string }> {
  await connectToDatabase();
  const cleanUser = username.trim();
  const hashed = hashPassword(passwordPlain.trim());

  const creds = {
    username: cleanUser,
    password: hashed,
  };

  await Setting.findOneAndUpdate(
    { key: 'admin_credentials' },
    { value: JSON.stringify(creds), updatedAt: new Date() },
    { upsert: true, new: true }
  );

  return { username: cleanUser };
}

export async function validateAdminCredentials(user: string, pass: string): Promise<boolean> {
  const creds = await getAdminCredentials();
  if (!safeCompare(user.trim(), creds.username.trim())) {
    return false;
  }
  return verifyPassword(pass.trim(), creds.passwordRawOrHash);
}

/**
 * Server-Side Admin Guard for /api/admin/* endpoints
 * Verifies either Admin Session Token or valid Admin API Key
 */
export async function verifyAdminRequest(req: NextRequest): Promise<{ authorized: boolean; username?: string }> {
  // 1. Check Session Token in x-admin-token or Authorization: Bearer <token>
  const adminTokenHeader = req.headers.get('x-admin-token');
  if (adminTokenHeader) {
    const session = verifyAdminSessionToken(adminTokenHeader.trim());
    if (session.valid) {
      return { authorized: true, username: session.username };
    }
  }

  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    // Try as session token first
    const session = verifyAdminSessionToken(token);
    if (session.valid) {
      return { authorized: true, username: session.username };
    }
    // Try as API Key
    const activeKey = await getCurrentApiKey();
    const envKey = process.env.ADMIN_API_KEY || 'hfl_key_8899aabbccddeeff00112233';
    if (safeCompare(token, activeKey) || safeCompare(token, envKey)) {
      return { authorized: true, username: 'api_admin' };
    }
  }

  // 2. Check x-api-key header
  const apiKeyHeader = req.headers.get('x-api-key');
  if (apiKeyHeader) {
    const activeKey = await getCurrentApiKey();
    const envKey = process.env.ADMIN_API_KEY || 'hfl_key_8899aabbccddeeff00112233';
    if (safeCompare(apiKeyHeader.trim(), activeKey) || safeCompare(apiKeyHeader.trim(), envKey)) {
      return { authorized: true, username: 'api_admin' };
    }
  }

  return { authorized: false };
}
