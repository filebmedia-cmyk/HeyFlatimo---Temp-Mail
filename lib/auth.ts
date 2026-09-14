import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Setting } from '@/lib/models/Setting';

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

  return providedKey === activeKey || providedKey === envKey;
}

export interface AdminCredentials {
  username: string;
  password: string;
}

export async function getAdminCredentials(): Promise<AdminCredentials> {
  const defaultUser = process.env.ADMIN_USERNAME || 'HeyFlatimo';
  const defaultPass = process.env.ADMIN_PASSWORD || 'TmailFlatimo';

  try {
    await connectToDatabase();
    const setting = await Setting.findOne({ key: 'admin_credentials' }).lean();
    if (setting && (setting as any).value) {
      const parsed = JSON.parse((setting as any).value);
      return {
        username: parsed.username || defaultUser,
        password: parsed.password || defaultPass,
      };
    }
  } catch (err) {
    console.error('Error fetching admin credentials:', err);
  }

  return { username: defaultUser, password: defaultPass };
}

export async function saveAdminCredentials(username: string, password: string): Promise<AdminCredentials> {
  await connectToDatabase();
  const creds = { username: username.trim(), password: password.trim() };
  await Setting.findOneAndUpdate(
    { key: 'admin_credentials' },
    { value: JSON.stringify(creds), updatedAt: new Date() },
    { upsert: true, new: true }
  );
  return creds;
}

export async function validateAdminCredentials(user: string, pass: string): Promise<boolean> {
  const creds = await getAdminCredentials();
  return user === creds.username && pass === creds.password;
}
