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
    id: `ann_${Date.now()}`, // Generate new ID whenever updated so once_per_device triggers again
  };

  await Setting.findOneAndUpdate(
    { key: 'announcement' },
    { value: JSON.stringify(updated), updatedAt: new Date() },
    { upsert: true, new: true }
  );

  return updated;
}
