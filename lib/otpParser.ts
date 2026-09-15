// Helper cerdas dan presisi tinggi untuk mengekstrak kode OTP dan Link Verifikasi dari pesan email

export interface ExtractedOtpResult {
  found: boolean;
  otp: string | null;
  allCandidates: string[];
  context?: string;
}

export interface ExtractedLinkItem {
  url: string;
  label: string;
  score: number;
  isVerification: boolean;
}

export interface ExtractedLinksResult {
  found: boolean;
  primaryLink: string | null;
  primaryLabel?: string | null;
  allLinks: string[];
}

const STOP_WORDS = new Set([
  'WHATSAPP',
  'TELEGRAM',
  'GOOGLE',
  'FACEBOOK',
  'INSTAGRAM',
  'VERIFY',
  'ACCOUNT',
  'SECURITY',
  'CONFIRM',
  'ACCESS',
  'LOGIN',
  'SIGNIN',
  'SIGNUP',
  'PASSWORD',
  'PASSCODE',
  'BERIKAN',
  'RAHASIA',
  'KODE',
  'CODE',
  'VERIFIKASI',
  'KEAMANAN',
  'KONFIRMASI',
  'AKTIVASI',
  'MASUK',
  'DAFTAR',
  'JANGAN',
  'EMAIL',
  'NOMOR',
  'NUMBER',
  'DEVICE',
  'PERANGKAT',
  'UNTUK',
  'ADALAH',
  'YOUR',
  'THIS',
  'KAMI',
  'ANDA',
  'KAMU',
  'SYSTEM',
  'TERIMA',
  'KASIH',
]);

/**
 * Pembersih Teks: Menghapus tanggal, waktu, format mata uang, nomor resi/pesanan,
 * dan pola angka non-OTP agar tidak salah mendeteksi angka tersebut sebagai kode OTP.
 */
export function cleanTextForOtp(input: string): string {
  if (!input) return '';

  return (
    input
      // 1. Hapus URL lengkap dan email terlebih dahulu agar angka di URL/email tidak dianggap OTP
      .replace(/https?:\/\/[^\s<>"']+/gi, ' ')
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, ' ')

      // 2. Hapus format Tanggal ISO (2026-09-15T18:30:00Z)
      .replace(/\b\d{4}-\d{2}-\d{2}(?:T|\s+)\d{2}:\d{2}(?::\d{2})?(?:\.\d+)?Z?\b/gi, ' ')

      // 3. Hapus Tanggal Standar (YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY, YYYY/MM/DD)
      .replace(/\b\d{4}[-/.]\d{1,2}[-/.]\d{1,2}\b/g, ' ')
      .replace(/\b\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}\b/g, ' ')

      // 4. Hapus Tanggal Nama Bulan (misal: "15 September 2026", "15 Sep 2026", "September 15, 2026", "15-Sep-2026")
      .replace(
        /\b\d{1,2}[-\s]+(?:Jan(?:uari)?|Feb(?:ruari)?|Mar(?:et)?|Apr(?:il)?|Mei|May|Jun(?:i)?|Jul(?:i)?|Agu(?:stus)?|Aug(?:ust)?|Sep(?:tember)?|Okt(?:ober)?|Oct(?:ober)?|Nov(?:ember)?|Des(?:ember)?|Dec(?:ember)?)[-\s]+\d{2,4}\b/gi,
        ' '
      )
      .replace(
        /\b(?:Jan(?:uari)?|Feb(?:ruari)?|Mar(?:et)?|Apr(?:il)?|Mei|May|Jun(?:i)?|Jul(?:i)?|Agu(?:stus)?|Aug(?:ust)?|Sep(?:tember)?|Okt(?:ober)?|Oct(?:ober)?|Nov(?:ember)?|Des(?:ember)?|Dec(?:ember)?)\s+\d{1,2},?\s+\d{2,4}\b/gi,
        ' '
      )

      // 5. Hapus Waktu/Jam (18:45:00, 18:45, 18.45 WIB, 08:30 PM)
      .replace(/\b\d{1,2}[:.]\d{2}(?::\d{2})?(?:\s*(?:WIB|WITA|WIT|AM|PM|UTC|GMT))?\b/gi, ' ')

      // 6. Hapus Nominal Uang / Rupiah (Rp 250.000, Rp. 250.000,00, $100.00, IDR 50.000)
      .replace(/(?:Rp\.?|IDR|\$|€|£|¥|USD|EUR)\s*[\d.,]+/gi, ' ')
      .replace(/\b[\d.,]+(?:\s*,-|\s*rupiah|\s*dollars?)\b/gi, ' ')

      // 7. Hapus Nomor Resi / Order / Invoice / Telepon / Kode Pos
      .replace(/\b(?:INV|ORDER|RESI|TRX|TXN|NO|NOMOR|REF|TICKET|ID|PESANAN)[-:#\s]*[A-Z0-9-]+\b/gi, ' ')
      .replace(/\b(?:kodepos|postal\s*code|zip\s*code)[\s:]*\d{4,6}\b/gi, ' ')
      .replace(/(?:\+?62|08|\+1|\+44|\+60)\d{8,13}\b/g, ' ')
      .replace(/\(?0\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,5}\b/g, ' ')

      // 8. Hapus Tahun umum 1900 - 2099 jika berdiri sendiri
      .replace(/\b(19\d\d|20[0-9]\d)\b/g, ' ')

      // 9. Hapus tag HTML
      .replace(/<[^>]*>/g, ' ')
  );
}

/**
 * Validasi apakah kode adalah format OTP yang sah
 */
export function isValidOtpCode(code: string): boolean {
  if (!code) return false;
  const clean = code.trim().toUpperCase();
  if (STOP_WORDS.has(clean)) return false;

  // Kode berformat awalan huruf atau pemisah tanda hubung (misal: G-492018 atau 849-201)
  if (/^[A-Z0-9]{1,3}-[0-9]{3,6}$/.test(clean)) return true;

  // Kode angka murni: 4 hingga 8 digit
  if (/^[0-9]{4,8}$/.test(clean)) {
    const num = parseInt(clean, 10);
    // Tolak tahun umum 1950 - 2050 jika 4 digit
    if (clean.length === 4 && num >= 1950 && num <= 2050) return false;
    return true;
  }

  // Kode alfanumerik: 4 hingga 8 karakter dan wajib memiliki setidaknya 1 angka (misal: X9K2P4)
  if (/^[A-Z0-9]{4,8}$/.test(clean) && /\d/.test(clean)) {
    return true;
  }

  return false;
}

export function extractOtp(text: string = '', html: string = '', subject: string = ''): ExtractedOtpResult {
  const candidates: string[] = [];

  const cleanSubject = cleanTextForOtp(subject);
  const cleanBody = cleanTextForOtp(`${text} ${html}`);
  const combined = `${cleanSubject}\n${cleanBody}`;

  const fullRaw = `${subject} ${text} ${html}`;
  const hasAuthContext =
    /(?:otp|one[- ]time\s+pass(?:word|code)|kode\s+verifikasi|verification\s+code|security\s+code|kode\s+keamanan|confirmation\s+code|kode\s+konfirmasi|login\s+code|kode\s+masuk|passcode|auth\s+code|aktivasi|activate|verifikasi|verify|2fa|two[- ]factor)/i.test(
      fullRaw
    );

  // 1. Pola RegEx OTP Berpresisi Tinggi
  const highConfidenceRegexes = [
    // Pola Frasa Kode Verifikasi / Keamanan / Konfirmasi dengan kata perantara terbatas
    /(?:kode\s+(?:verifikasi|keamanan|konfirmasi|otp|akses|rahasia|masuk|login|otentikasi)|verification\s+code|security\s+code|confirmation\s+code|otp\s+code|login\s+code|passcode|auth(?:entication)?\s+code)(?:\s+(?:is|your|for|to|adalah|ini|anda|kamu|berikut)){0,4}[\s:=#]*([A-Z]-[0-9]{4,8}|[0-9]{3,4}-[0-9]{3,4}|[0-9]{4,8}|(?=[A-Z0-9]*\d)[A-Z0-9]{4,8})\b/i,

    // Pola Aksi: "masukkan kode 123456", "use code 123456", "your code is 123456", "kode anda adalah 123456"
    /(?:kode\s+(?:anda|kamu|ini)\s+(?:adalah|:)|your\s+(?:code|otp|passcode|pin)\s+(?:is|:)|use\s+(?:code|otp|passcode)|enter\s+(?:code|otp|passcode)|masukkan\s+kode|gunakan\s+kode)[\s:=#]*([A-Z]-[0-9]{4,8}|[0-9]{3,4}-[0-9]{3,4}|[0-9]{4,8}|(?=[A-Z0-9]*\d)[A-Z0-9]{4,8})\b/i,

    // Pola Sufiks: "G-492018 is your Google verification code" atau "123456 is your verification code"
    /(?:^|\s)([A-Z]-[0-9]{4,8}|[0-9]{3,4}-[0-9]{3,4}|[0-9]{4,8}|(?=[A-Z0-9]*\d)[A-Z0-9]{4,8})\s+(?:is\s+your\s+(?:verification|security|login|otp|confirmation|access|auth|google|whatsapp)\s+code|adalah\s+kode\s+(?:verifikasi|keamanan|otp|akses|masuk|konfirmasi)|is\s+your\s+(?:code|otp|passcode)|untuk\s+verifikasi\s+akun|to\s+verify\s+your\s+account)/i,

    // Standalone OTP label
    /\b(?:otp|one[- ]time\s+pass(?:word|code))[\s:=#]*([A-Z]-[0-9]{4,8}|[0-9]{3,4}-[0-9]{3,4}|[0-9]{4,8}|(?=[A-Z0-9]*\d)[A-Z0-9]{4,8})\b/i,
  ];

  for (const regex of highConfidenceRegexes) {
    let match;
    const globalRegex = new RegExp(regex.source, 'gi');
    while ((match = globalRegex.exec(combined)) !== null) {
      const code = match[1]?.trim();
      if (code && isValidOtpCode(code) && !candidates.includes(code)) {
        candidates.push(code);
      }
    }
  }

  // 2. Jika Subjek secara eksplisit memiliki label kode/OTP (misal: "Kode verifikasi Anda: 849201")
  if (candidates.length === 0 && /(?:otp|kode|code|pin)/i.test(subject)) {
    const subjMatch = cleanSubject.match(
      /(?:otp|kode|code|pin)[\s:=#]*([A-Z]-[0-9]{4,8}|[0-9]{3,4}-[0-9]{3,4}|[0-9]{4,8}|(?=[A-Z0-9]*\d)[A-Z0-9]{4,8})\b/i
    );
    if (subjMatch) {
      const code = subjMatch[1]?.trim();
      if (code && isValidOtpCode(code) && !candidates.includes(code)) {
        candidates.push(code);
      }
    }
  }

  // 3. Tag HTML Highlighted (<code>, <strong/b>, <h1-h3>) HANYA jika email memiliki konteks autentikasi/keamanan
  if (candidates.length === 0 && hasAuthContext) {
    const htmlStructuralRegex =
      /<(?:code|strong|b|h1|h2|h3)[^>]*>[\s\r\n]*([A-Z]-[0-9]{4,8}|[0-9]{3,4}-[0-9]{3,4}|[0-9]{4,8}|(?=[A-Z0-9]*\d)[A-Z0-9]{4,8})[\s\r\n]*<\/(?:code|strong|b|h1|h2|h3)>/gi;
    let match;
    while ((match = htmlStructuralRegex.exec(html)) !== null) {
      const code = match[1]?.trim();
      if (code && isValidOtpCode(code) && !candidates.includes(code)) {
        candidates.push(code);
      }
    }
  }

  const primaryOtp = candidates.length > 0 ? candidates[0] : null;

  return {
    found: primaryOtp !== null,
    otp: primaryOtp,
    allCandidates: candidates,
  };
}

/**
 * Decode nested/wrapped redirect tracking URLs
 * e.g. https://email.company.com/click?url=https%3A%2F%2Fapp.com%2Fverify%3Ftoken%3D123
 */
function unwrapTrackingUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl);
    const searchParams = parsed.searchParams;
    for (const key of ['url', 'target', 'dest', 'destination', 'redirect', 'next', 'u', 'r', 'link']) {
      const nested = searchParams.get(key);
      if (nested && (nested.startsWith('http://') || nested.startsWith('https://'))) {
        return decodeURIComponent(nested);
      }
    }
  } catch (e) {
    // If not a valid URL object, return raw
  }
  return rawUrl;
}

export function extractLinks(text: string = '', html: string = ''): ExtractedLinksResult {
  const linkCandidates: ExtractedLinkItem[] = [];
  const seenUrls = new Set<string>();

  const isInvalidUrl = (u: string) => {
    const lower = u.toLowerCase();
    return (
      lower.includes('schemas.microsoft.com') ||
      lower.includes('w3.org') ||
      lower.includes('schema.org') ||
      lower.startsWith('mailto:') ||
      lower.startsWith('tel:') ||
      lower.startsWith('javascript:') ||
      lower.endsWith('.png') ||
      lower.endsWith('.jpg') ||
      lower.endsWith('.jpeg') ||
      lower.endsWith('.gif') ||
      lower.endsWith('.svg') ||
      lower.endsWith('.css') ||
      lower.endsWith('.pdf') ||
      lower.endsWith('.js')
    );
  };

  // 1. Ekstrak dari Tag HTML `<a ... href="...">Text</a>`
  const anchorTagRegex = /<a\b([^>]*?)href=["']([^"'\s>]+)["']([^>]*)>([\s\S]*?)<\/a>/gi;
  let anchorMatch;

  while ((anchorMatch = anchorTagRegex.exec(html)) !== null) {
    const beforeAttr = anchorMatch[1] || '';
    const rawUrl = anchorMatch[2].trim();
    const afterAttr = anchorMatch[3] || '';
    const innerHtml = anchorMatch[4] || '';

    // Bersihkan inner text dari tag child (misal <span> atau <b>)
    const labelText = innerHtml.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const fullAttr = `${beforeAttr} ${afterAttr}`;

    if (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) continue;
    if (isInvalidUrl(rawUrl)) continue;

    // Ambil konteks di sekitar tag ini (150 karakter sebelum dan sesudah)
    const matchIndex = anchorMatch.index;
    const surroundingSnippet = html
      .slice(Math.max(0, matchIndex - 150), matchIndex + anchorMatch[0].length + 150)
      .replace(/<[^>]*>/g, ' ');

    let score = 0;
    const lowerLabel = labelText.toLowerCase();
    const lowerUrl = rawUrl.toLowerCase();
    const lowerSurrounding = surroundingSnippet.toLowerCase();

    // ==========================================
    // SKORING: Teks Tombol / Anchor Label
    // ==========================================
    // Keyword Verifikasi Akun / Email / Langganan (Sangat Tinggi)
    const highIntentLabelKeywords = [
      'verifikasi',
      'verify',
      'aktivasi',
      'activate',
      'aktifkan',
      'konfirmasi',
      'confirm',
      'langganan',
      'subscription',
      'subscribe',
      'ini link',
      'this link',
      'link verifikasi',
      'link aktivasi',
      'complete registration',
      'claim access',
      'setujui',
      'reset password',
      'magic link',
      'login link',
      'masuk sekarang',
      'claim your',
    ];

    let hasHighIntentLabel = false;
    for (const kw of highIntentLabelKeywords) {
      if (lowerLabel.includes(kw)) {
        score += 60;
        hasHighIntentLabel = true;
        break;
      }
    }

    // Spesifik frase aksi verifikasi
    if (
      lowerLabel.includes('verifikasi email') ||
      lowerLabel.includes('verifikasi akun') ||
      lowerLabel.includes('verify email') ||
      lowerLabel.includes('verify account') ||
      lowerLabel.includes('aktifkan akun') ||
      lowerLabel.includes('activate account') ||
      lowerLabel.includes('konfirmasi langganan') ||
      lowerLabel.includes('confirm subscription') ||
      lowerLabel.includes('ini link') ||
      lowerLabel.includes('link verifikasi')
    ) {
      score += 40;
    }

    // Generic CTA labels ("klik di sini", "click here", "buka link", "get started") only get points if surrounding text has verification context
    const isGenericCta =
      /(?:klik\s*di\s*sini|klik\s*disini|click\s*here|buka\s*link|open\s*link|get\s*started|continue|lanjutkan|buka|lihat)/i.test(
        lowerLabel
      );
    if (isGenericCta) {
      const hasSurroundingContext =
        /(?:verif|aktivasi|activate|confirm|konfirmasi|langganan|subscription|daftar|register|signup|akun|account|security|keamanan|reset)/i.test(
          lowerSurrounding
        );
      if (hasSurroundingContext) {
        score += 40;
      }
    }

    // ==========================================
    // SKORING: URL & Query Token
    // ==========================================
    const urlIntentKeywords = [
      'verify',
      'verification',
      'activate',
      'activation',
      'confirm',
      'confirmation',
      'subscription',
      'subscribe',
      'magic-link',
      'auth-token',
      'email-verification',
      'validate-email',
    ];

    let hasHighIntentUrl = false;
    for (const kw of urlIntentKeywords) {
      if (lowerUrl.includes(kw)) {
        score += 45;
        hasHighIntentUrl = true;
        break;
      }
    }

    // Ada parameter token / kode keamanan di URL (misal ?token=... / ?code=... / ?key=...)
    if (/(?:token|code|key|auth|signature|hash|verification_token)=/i.test(rawUrl)) {
      score += 30;
    }

    // ==========================================
    // SKORING: Konteks Kalimat Sekitar Tombol
    // ==========================================
    if (
      lowerSurrounding.includes('verifikasi') ||
      lowerSurrounding.includes('aktifkan') ||
      lowerSurrounding.includes('konfirmasi') ||
      lowerSurrounding.includes('langganan') ||
      lowerSurrounding.includes('verify') ||
      lowerSurrounding.includes('activate') ||
      lowerSurrounding.includes('confirm') ||
      lowerSurrounding.includes('subscription')
    ) {
      score += 20;
    }

    // Tombol CTA (Class seperti btn, button, cta)
    if (/(?:btn|button|cta|action-link|verify-btn)/i.test(fullAttr)) {
      score += 15;
    }

    // ==========================================
    // PENALTI: Link Unsubscribe / Social / Privacy
    // ==========================================
    const isUnsubscribe = /(?:unsubscribe|optout|opt-out|berhenti\s*langganan)/i.test(
      `${lowerLabel} ${lowerUrl}`
    );

    const isPrivacyOrTerms = /(?:privacy|terms|syarat|ketentuan|kebijakan|bantuan|support|help|faq)/i.test(
      `${lowerLabel} ${lowerUrl}`
    );

    const isSocialMedia =
      /(?:facebook\.com|twitter\.com|x\.com|instagram\.com|linkedin\.com|youtube\.com|tiktok\.com|pinterest\.com)/i.test(
        lowerUrl
      );

    if (isUnsubscribe) score -= 300;
    if (isPrivacyOrTerms) score -= 200;
    if (isSocialMedia) score -= 200;

    // Homepage penalty
    try {
      const parsed = new URL(rawUrl);
      if (parsed.pathname === '/' && !parsed.search && !hasHighIntentLabel) {
        score -= 150;
      }
    } catch (e) {}

    const finalUrl = unwrapTrackingUrl(rawUrl);
    const isLegitVerification = score >= 55 && (hasHighIntentLabel || hasHighIntentUrl || isGenericCta);

    if (!seenUrls.has(finalUrl)) {
      seenUrls.add(finalUrl);
      linkCandidates.push({
        url: finalUrl,
        label: labelText || 'Buka Link Verifikasi',
        score,
        isVerification: isLegitVerification,
      });
    }
  }

  // 2. Ekstrak URL polos dari plain text (jika format email plain text atau link raw)
  const combinedContent = `${html}\n${text}`;
  const plainUrlRegex = /(https?:\/\/[^\s<>"']+)/gi;
  let textMatch;
  while ((textMatch = plainUrlRegex.exec(combinedContent)) !== null) {
    const rawUrl = textMatch[1].trim();
    const finalUrl = unwrapTrackingUrl(rawUrl);
    const lowerUrl = finalUrl.toLowerCase();

    if (seenUrls.has(finalUrl) || isInvalidUrl(finalUrl)) continue;

    let score = 0;

    if (
      /(?:verify|verifikasi|activate|aktifkan|confirm|konfirmasi|magic|subscribe|langganan|signup)/i.test(
        lowerUrl
      )
    ) {
      score += 50;
    }
    if (/(?:token|code|key|auth|signature|hash)=/i.test(finalUrl)) {
      score += 35;
    }

    const matchIdx = textMatch.index;
    const surrounding = combinedContent
      .slice(Math.max(0, matchIdx - 150), matchIdx + textMatch[0].length + 150)
      .toLowerCase();

    if (
      /(?:verifikasi|aktifkan|konfirmasi|langganan|verify|activate|confirm|ini\s*link|buka\s*link|tautan\s*berikut)/i.test(
        surrounding
      )
    ) {
      score += 30;
    }

    if (lowerUrl.includes('unsubscribe') || lowerUrl.includes('optout')) score -= 300;
    if (lowerUrl.includes('privacy') || lowerUrl.includes('terms')) score -= 200;

    try {
      const parsed = new URL(finalUrl);
      if (parsed.pathname === '/' && !parsed.search) {
        score -= 150;
      }
    } catch (e) {}

    const isLegitVerification = score >= 55;

    seenUrls.add(finalUrl);
    linkCandidates.push({
      url: finalUrl,
      label: 'Buka Link Verifikasi',
      score,
      isVerification: isLegitVerification,
    });
  }

  // Urutkan berdasarkan skor tertinggi
  linkCandidates.sort((a, b) => b.score - a.score);

  // HANYA kembalikan link jika terbukti link verifikasi yang valid (score >= 55 & isVerification === true)
  const validVerificationLinks = linkCandidates.filter((l) => l.isVerification && l.score >= 55);
  const primaryItem = validVerificationLinks.length > 0 ? validVerificationLinks[0] : null;

  return {
    found: primaryItem !== null,
    primaryLink: primaryItem ? primaryItem.url : null,
    primaryLabel: primaryItem ? primaryItem.label : null,
    allLinks: linkCandidates.map((l) => l.url),
  };
}
