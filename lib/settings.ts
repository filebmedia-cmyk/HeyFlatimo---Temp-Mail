import { connectToDatabase } from './mongodb';
import { Setting } from './models/Setting';

export interface AccessSettings {
  enabled: boolean;
  key: string;
  message: string;
}

export interface AnnouncementSettings {
  enabled: boolean;
  id: string;
  title: string;
  content: string;
  tag: string;
  displayMode: 'always' | 'once_per_session' | 'once_per_device';
  buttonEnabled?: boolean;
  buttonText?: string;
  buttonLink?: string;
}

const DEFAULT_ACCESS_SETTINGS: AccessSettings = {
  enabled: false,
  key: '123456',
  message: 'Silakan masukkan kode akses untuk menggunakan layanan email sementara ini.',
};

const DEFAULT_ANNOUNCEMENT_SETTINGS: AnnouncementSettings = {
  enabled: false,
  id: 'ann_init',
  title: 'Pemberitahuan Sistem',
  content: 'Selamat datang di layanan HeyFlatimo Personal Temp Mail.',
  tag: 'PENGUMUMAN',
  displayMode: 'once_per_device',
  buttonEnabled: false,
  buttonText: 'Kunjungi Tautan',
  buttonLink: '',
};

export async function getAccessSettings(): Promise<AccessSettings> {
  try {
    await connectToDatabase();
    const setting = await Setting.findOne({ key: 'access_control' }).lean();
    if (setting && setting.value) {
      return { ...DEFAULT_ACCESS_SETTINGS, ...JSON.parse(setting.value) };
    }
  } catch (err) {
    console.error('Error fetching access settings:', err);
  }
  return DEFAULT_ACCESS_SETTINGS;
}

export async function saveAccessSettings(settings: Partial<AccessSettings>): Promise<AccessSettings> {
  await connectToDatabase();
  const current = await getAccessSettings();
  const updated: AccessSettings = {
    ...current,
    ...settings,
    key: settings.key !== undefined ? settings.key.trim() : current.key,
  };

  await Setting.findOneAndUpdate(
    { key: 'access_control' },
    { value: JSON.stringify(updated), updatedAt: new Date() },
    { upsert: true, new: true }
  );

  return updated;
}

export async function getAnnouncementSettings(): Promise<AnnouncementSettings> {
  try {
    await connectToDatabase();
    const setting = await Setting.findOne({ key: 'announcement' }).lean();
    if (setting && setting.value) {
      return { ...DEFAULT_ANNOUNCEMENT_SETTINGS, ...JSON.parse(setting.value) };
    }
  } catch (err) {
    console.error('Error fetching announcement settings:', err);
  }
  return DEFAULT_ANNOUNCEMENT_SETTINGS;
}

export async function saveAnnouncementSettings(
  settings: Partial<AnnouncementSettings>
): Promise<AnnouncementSettings> {
  await connectToDatabase();
  const current = await getAnnouncementSettings();
  const updated: AnnouncementSettings = {
    ...current,
    ...settings,
    buttonEnabled: settings.buttonEnabled !== undefined ? Boolean(settings.buttonEnabled) : current.buttonEnabled,
    buttonText: settings.buttonText !== undefined ? settings.buttonText.trim() : (current.buttonText || 'Kunjungi Tautan'),
    buttonLink: settings.buttonLink !== undefined ? settings.buttonLink.trim() : (current.buttonLink || ''),
    id: `ann_${Date.now()}`, // Generate new ID whenever updated so once_per_device triggers again
  };

  await Setting.findOneAndUpdate(
    { key: 'announcement' },
    { value: JSON.stringify(updated), updatedAt: new Date() },
    { upsert: true, new: true }
  );

  return updated;
}

export interface TelegramSettings {
  botToken: string;
  botUsername?: string;
  adminId?: string;
  enabled: boolean;
  webhookUrl?: string;
}

export interface RetentionSettings {
  retentionHours: number; // e.g. 24 (default 24h), 1, 6, 12, 48, 72, 168 (7d), 0 (never)
}

const DEFAULT_TELEGRAM_SETTINGS: TelegramSettings = {
  botToken: '',
  botUsername: '',
  adminId: '',
  enabled: false,
  webhookUrl: '',
};

const DEFAULT_RETENTION_SETTINGS: RetentionSettings = {
  retentionHours: 72, // 3 Hari (72 Jam Standar WIB)
};

export async function getTelegramSettings(): Promise<TelegramSettings> {
  try {
    await connectToDatabase();
    const setting = await Setting.findOne({ key: 'telegram_bot' }).lean();
    if (setting && setting.value) {
      return { ...DEFAULT_TELEGRAM_SETTINGS, ...JSON.parse(setting.value) };
    }
  } catch (err) {
    console.error('Error fetching telegram settings:', err);
  }
  return DEFAULT_TELEGRAM_SETTINGS;
}

export async function saveTelegramSettings(settings: Partial<TelegramSettings>): Promise<TelegramSettings> {
  await connectToDatabase();
  const current = await getTelegramSettings();
  const updated: TelegramSettings = {
    ...current,
    ...settings,
    botToken: settings.botToken !== undefined ? settings.botToken.trim() : current.botToken,
    adminId: settings.adminId !== undefined ? settings.adminId.trim() : (current.adminId || ''),
  };

  await Setting.findOneAndUpdate(
    { key: 'telegram_bot' },
    { value: JSON.stringify(updated), updatedAt: new Date() },
    { upsert: true, new: true }
  );

  return updated;
}

export async function getRetentionSettings(): Promise<RetentionSettings> {
  try {
    await connectToDatabase();
    const setting = await Setting.findOne({ key: 'db_retention' }).lean();
    if (setting && setting.value) {
      return { ...DEFAULT_RETENTION_SETTINGS, ...JSON.parse(setting.value) };
    }
  } catch (err) {
    console.error('Error fetching retention settings:', err);
  }
  return DEFAULT_RETENTION_SETTINGS;
}

export async function saveRetentionSettings(settings: Partial<RetentionSettings>): Promise<RetentionSettings> {
  await connectToDatabase();
  const current = await getRetentionSettings();
  const updated: RetentionSettings = {
    ...current,
    ...settings,
    retentionHours: typeof settings.retentionHours === 'number' ? settings.retentionHours : current.retentionHours,
  };

  await Setting.findOneAndUpdate(
    { key: 'db_retention' },
    { value: JSON.stringify(updated), updatedAt: new Date() },
    { upsert: true, new: true }
  );

  return updated;
}
