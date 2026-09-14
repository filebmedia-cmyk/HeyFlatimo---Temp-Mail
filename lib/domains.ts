import { connectToDatabase } from '@/lib/mongodb';
import { Domain } from '@/lib/models/Domain';

export async function getAllDomains(): Promise<string[]> {
  const envDomainsRaw = process.env.NEXT_PUBLIC_AVAILABLE_DOMAINS || '';
  const envDomains = envDomainsRaw
    .split(',')
    .map((d) => d.trim().toLowerCase())
    .filter((d) => d.length > 0);

  const domainSet = new Set<string>(envDomains);

  try {
    await connectToDatabase();
    const dbDomains = await Domain.find().lean();
    for (const d of dbDomains) {
      if ((d as any).domain) {
        domainSet.add((d as any).domain.toLowerCase().trim());
      }
    }
  } catch (err) {
    // If DB is offline, continue with env domains
  }

  const result = Array.from(domainSet);
  return result;
}

export async function addDomainToDb(rawDomain: string): Promise<{ success: boolean; message: string; domains: string[] }> {
  const clean = rawDomain
    .trim()
    .toLowerCase()
    .replace(/^@+/, '')
    .replace(/[^a-z0-9.-]/g, '');

  if (!clean || !clean.includes('.')) {
    throw new Error('Format domain tidak valid (contoh: mail.domainanda.com)');
  }

  await connectToDatabase();

  await Domain.findOneAndUpdate(
    { domain: clean },
    { $set: { domain: clean, createdAt: new Date() } },
    { upsert: true, new: true }
  );

  const updatedDomains = await getAllDomains();
  return {
    success: true,
    message: `Domain @${clean} berhasil ditambahkan`,
    domains: updatedDomains,
  };
}

export async function removeDomainFromDb(rawDomain: string): Promise<{ success: boolean; message: string; domains: string[] }> {
  const clean = rawDomain
    .trim()
    .toLowerCase()
    .replace(/^@+/, '');

  await connectToDatabase();
  await Domain.findOneAndDelete({ domain: clean });

  const updatedDomains = await getAllDomains();
  return {
    success: true,
    message: `Domain @${clean} berhasil dihapus dari database`,
    domains: updatedDomains,
  };
}
