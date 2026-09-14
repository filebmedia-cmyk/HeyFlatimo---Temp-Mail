// Helper cerdas untuk mengekstrak kode OTP dan Link Verifikasi dari pesan email

export interface ExtractedOtpResult {
  found: boolean;
  otp: string | null;
  allCandidates: string[];
  context?: string;
}

export interface ExtractedLinksResult {
  found: boolean;
  primaryLink: string | null;
  allLinks: string[];
}

export function extractOtp(text: string = '', html: string = '', subject: string = ''): ExtractedOtpResult {
  const combined = `${subject}\n${text}\n${html.replace(/<[^>]*>/g, ' ')}`;

  const candidates: string[] = [];

  // 1. Pola kontekstual kata kunci (OTP, Code, Kode, PIN, Verifikasi, dll.)
  const contextRegexes = [
    /(?:otp|code|kode|verifikasi|verification|pin|passcode|token)[\s:=#\-\.]*([0-9]{4,8})/gi,
    /([0-9]{4,8})[\s\S]{0,25}(?:is your|adalah kode|adalah OTP|is the verification code)/gi,
    /(?:your code is|kode anda:|kode verifikasi:|verification code:?)[\s:=#\-\.]*([0-9]{4,8})/gi,
  ];

  for (const regex of contextRegexes) {
    let match;
    while ((match = regex.exec(combined)) !== null) {
      if (match[1] && !candidates.includes(match[1])) {
        candidates.push(match[1]);
      }
    }
  }

  // 2. Jika belum ditemukan, cari angka terisolasi 4 - 8 digit (misal: 6 digit OTP standar)
  if (candidates.length === 0) {
    const isolatedDigitRegex = /\b([0-9]{4,8})\b/g;
    let match;
    while ((match = isolatedDigitRegex.exec(combined)) !== null) {
      const num = match[1];
      // Abaikan tahun umum (2020 - 2030) jika hanya 4 digit
      if (num.length === 4 && parseInt(num, 10) >= 2020 && parseInt(num, 10) <= 2030) {
        continue;
      }
      if (!candidates.includes(num)) {
        candidates.push(num);
      }
    }
  }

  // 3. Cari 6-digit angka di subject (sering kali kode ditaruh di subjek)
  const subjectMatch = subject.match(/\b([0-9]{4,8})\b/);
  if (subjectMatch && !candidates.includes(subjectMatch[1])) {
    candidates.unshift(subjectMatch[1]);
  }

  const primaryOtp = candidates.length > 0 ? candidates[0] : null;

  return {
    found: primaryOtp !== null,
    otp: primaryOtp,
    allCandidates: candidates,
  };
}

export function extractLinks(text: string = '', html: string = ''): ExtractedLinksResult {
  const combined = `${html}\n${text}`;
  const linkSet = new Set<string>();

  // 1. Ekstrak href dari HTML
  const hrefRegex = /href=["'](https?:\/\/[^"'\s>]+)["']/gi;
  let match;
  while ((match = hrefRegex.exec(html)) !== null) {
    const url = match[1].trim();
    if (url.startsWith('http') && !url.includes('schemas.microsoft.com') && !url.includes('w3.org')) {
      linkSet.add(url);
    }
  }

  // 2. Ekstrak URL polos dari teks
  const urlRegex = /(https?:\/\/[^\s<>"']+)/gi;
  while ((match = urlRegex.exec(text)) !== null) {
    const url = match[1].trim();
    if (url.startsWith('http') && !url.includes('schemas.microsoft.com') && !url.includes('w3.org')) {
      linkSet.add(url);
    }
  }

  const allLinks = Array.from(linkSet);

  // Cari link prioritas yang merupakan tombol aktivasi / verifikasi
  let primaryLink: string | null = null;
  const keywords = ['verify', 'confirm', 'activate', 'verifikasi', 'konfirmasi', 'token', 'auth', 'login', 'action'];

  for (const link of allLinks) {
    const lower = link.toLowerCase();
    if (keywords.some((k) => lower.includes(k))) {
      primaryLink = link;
      break;
    }
  }

  if (!primaryLink && allLinks.length > 0) {
    primaryLink = allLinks[0];
  }

  return {
    found: allLinks.length > 0,
    primaryLink,
    allLinks,
  };
}
