import { connectToDatabase } from '@/lib/mongodb';
import { Domain } from '@/lib/models/Domain';

export interface DomainItem {
  domain: string;
  isVip: boolean;
  createdAt?: Date;
}

/**
 * Normalize domain string by trimming, lowercasing, and removing leading @ and invalid characters
 */
export function normalizeDomain(domain: string): string {
  if (!domain || typeof domain !== 'string') return '';
  return domain
    .trim()
    .toLowerCase()
    .replace(/^@+/, '')
    .replace(/[^a-z0-9.-]/g, '');
}

/**
 * Extract clean normalized domain from an email address or raw domain string
 */
export function extractDomainFromEmail(emailOrDomain: string): string {
  if (!emailOrDomain || typeof emailOrDomain !== 'string') return '';
  const clean = emailOrDomain.trim().toLowerCase();
  if (clean.includes('@')) {
    const parts = clean.split('@');
    return normalizeDomain(parts[parts.length - 1]);
  }
  return normalizeDomain(clean);
}

/**
 * Get all domains as full objects with VIP status
 */
export async function getAllDomainDetails(): Promise<DomainItem[]> {
  const envDomainsRaw =
    process.env.NEXT_PUBLIC_AVAILABLE_DOMAINS ||
    process.env.AVAILABLE_DOMAINS ||
    '';
  const envDomains = envDomainsRaw
    .split(',')
    .map((d) => normalizeDomain(d))
    .filter((d) => d.length > 0 && d.includes('.'));

  const domainMap = new Map<string, DomainItem>();

  for (const d of envDomains) {
    domainMap.set(d, { domain: d, isVip: false });
  }

  try {
    await connectToDatabase();
    const dbDomains = await Domain.find().lean();
    for (const d of dbDomains) {
      if ((d as any).domain) {
        const cleanName = normalizeDomain((d as any).domain);
        if (cleanName && cleanName.includes('.')) {
          domainMap.set(cleanName, {
            domain: cleanName,
            isVip: Boolean((d as any).isVip),
            createdAt: (d as any).createdAt,
          });
        }
      }
    }
  } catch (err) {
    // Continue with env domains if DB offline
  }

  return Array.from(domainMap.values()).sort((a, b) => {
    // 1. VIP domains always on top
    if (a.isVip && !b.isVip) return -1;
    if (!a.isVip && b.isVip) return 1;
    // 2. Alphabetical sort within the same VIP status
    return a.domain.localeCompare(b.domain);
  });
}

/**
 * Check if a domain or email belongs to a VIP domain
 */
export async function checkIsVipDomain(domainOrEmail: string): Promise<boolean> {
  const domainPart = extractDomainFromEmail(domainOrEmail);
  if (!domainPart) return false;
  const allDomains = await getAllDomainDetails();
  const matched = allDomains.find((d) => normalizeDomain(d.domain) === domainPart);
  return Boolean(matched?.isVip);
}

/**
 * Get all domain names as string array for backward compatibility
 */
export async function getAllDomains(): Promise<string[]> {
  const details = await getAllDomainDetails();
  return details.map((d) => d.domain);
}

/**
 * Add a new domain to MongoDB Atlas
 */
export async function addDomainToDb(
  rawDomain: string,
  isVip: boolean = false
): Promise<{ success: boolean; message: string; domains: DomainItem[] }> {
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
    { $set: { domain: clean, isVip: Boolean(isVip), createdAt: new Date() } },
    { upsert: true, new: true }
  );

  const updatedDomains = await getAllDomainDetails();
  return {
    success: true,
    message: `Domain @${clean} berhasil ditambahkan ${isVip ? 'sebagai VIP' : ''}`,
    domains: updatedDomains,
  };
}

/**
 * Toggle VIP status for a domain
 */
export async function toggleDomainVip(
  rawDomain: string,
  targetVipStatus?: boolean
): Promise<{ success: boolean; message: string; isVip: boolean; domains: DomainItem[] }> {
  const clean = rawDomain
    .trim()
    .toLowerCase()
    .replace(/^@+/, '');

  await connectToDatabase();
  const existing = await Domain.findOne({ domain: clean });

  const newStatus = typeof targetVipStatus === 'boolean' ? targetVipStatus : !existing?.isVip;

  await Domain.findOneAndUpdate(
    { domain: clean },
    { $set: { domain: clean, isVip: newStatus } },
    { upsert: true, new: true }
  );

  const updatedDomains = await getAllDomainDetails();
  return {
    success: true,
    message: `Status domain @${clean} diubah menjadi ${newStatus ? 'VIP' : 'Free'}`,
    isVip: newStatus,
    domains: updatedDomains,
  };
}

/**
 * Remove a domain from MongoDB Atlas
 */
export async function removeDomainFromDb(
  rawDomain: string
): Promise<{ success: boolean; message: string; domains: DomainItem[] }> {
  const clean = rawDomain
    .trim()
    .toLowerCase()
    .replace(/^@+/, '');

  await connectToDatabase();
  await Domain.findOneAndDelete({ domain: clean });

  const updatedDomains = await getAllDomainDetails();
  return {
    success: true,
    message: `Domain @${clean} berhasil dihapus dari database`,
    domains: updatedDomains,
  };
}
