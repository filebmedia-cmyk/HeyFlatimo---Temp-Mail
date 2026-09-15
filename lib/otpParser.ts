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

/**
 * Pembersih Teks: Menghapus tanggal, waktu, format mata uang, dan pola angka non-OTP
 * agar tidak salah mendeteksi tanggal (misal: 15/09/2026, 2026, 10:45:30) sebagai kode OTP.
 */
function cleanTextForOtp(input: string): string {
  if (!input) return '';

  return input
    // 1. Hapus URL lengkap dan email terlebih dahulu agar angka di URL/email tidak dianggap OTP
    .replace(/https?:\/\/[^\s<>"']+/gi, ' ')
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, ' ')

    // 2. Hapus format Tanggal ISO (2026-09-15T10:45:00Z)
    .replace(/\b\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z?\b/gi, ' ')

    // 3. Hapus Tanggal Standar (YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY, YYYY/MM/DD, DD.MM.YYYY)
    .replace(/\b\d{4}[-/.]\d{1,2}[-/.]\d{1,2}\b/g, ' ')
    .replace(/\b\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}\b/g, ' ')

    // 4. Hapus Tanggal Nama Bulan (misal: "15 September 2026", "15 Sep 2026", "September 15, 2026")
    .replace(
      /\b\d{1,2}\s+(?:Jan(?:uari)?|Feb(?:ruari)?|Mar(?:et)?|Apr(?:il)?|Mei|May|Jun(?:i)?|Jul(?:i)?|Agu(?:stus)?|Aug(?:ust)?|Sep(?:tember)?|Okt(?:ober)?|Oct(?:ober)?|Nov(?:ember)?|Des(?:ember)?|Dec(?:ember)?)\s+\d{2,4}\b/gi,
      ' '
    )
    .replace(
      /\b(?:Jan(?:uari)?|Feb(?:ruari)?|Mar(?:et)?|Apr(?:il)?|Mei|May|Jun(?:i)?|Jul(?:i)?|Agu(?:stus)?|Aug(?:ust)?|Sep(?:tember)?|Okt(?:ober)?|Oct(?:ober)?|Nov(?:ember)?|Des(?:ember)?|Dec(?:ember)?)\s+\d{1,2},?\s+\d{2,4}\b/gi,
      ' '
    )

    // 5. Hapus Waktu/Jam (HH:MM:SS, HH:MM WIB/AM/PM)
    .replace(/\b\d{1,2}:\d{2}(?::\d{2})?(?:\s*(?:WIB|WITA|WIT|AM|PM|UTC|GMT))?\b/gi, ' ')

    // 6. Hapus Nominal Uang / Rupiah (Rp 250.000, $100.00)
    .replace(/(?:Rp|IDR|\$|€|£|¥)\s*[\d.,]+/gi, ' ')

    // 7. Hapus Tahun umum 1900 - 2099 jika berdiri sendiri tanpa kata kunci
    .replace(/\b(19\d\d|20[0-9]\d)\b/g, ' ')

    // 8. Hapus format nomor telepon / seluler (+628..., 0812..., (021)...)
    .replace(/(?:\+62|62|08)\d{8,12}\b/g, ' ')
    .replace(/\(?0\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,5}\b/g, ' ')

    // 9. Hapus tag HTML
    .replace(/<[^>]*>/g, ' ');
}

export function extractOtp(text: string = '', html: string = '', subject: string = ''): ExtractedOtpResult {
  const candidates: string[] = [];

  // Bersihkan subject dan konten dari tanggal/waktu
  const cleanSubject = cleanTextForOtp(subject);
  const cleanBody = cleanTextForOtp(`${text} ${html}`);
  const combined = `${cleanSubject}\n${cleanBody}`;

  // 1. PRIORITY TIER 1: Pola Kontekstual Kuat (Indonesian & English)
  const highConfidenceRegexes = [
    // Subjek spesifik OTP
    /\b([0-9]{4,8})\b[\s\S]{0,30}(?:is\s+your|adalah\s+kode|adalah\s+OTP|verification\s+code|kode\s+verifikasi)/i,
    // Pola Frasa Kode Verifikasi / Keamanan / Konfirmasi
    /(?:kode\s+(?:verifikasi|keamanan|konfirmasi|otp|akses|rahasia|masuk|login)(?:\s+(?:anda|kamu|ini))?(?:\s+(?:adalah|:))?|verification\s+code|security\s+code|confirmation\s+code|otp\s+code|login\s+code|passcode)[\s:=#\-\.]*([0-9]{4,8})\b/i,
    // Pola "kode anda adalah: 123456" atau "your code is: 123456"
    /(?:kode\s+(?:anda|kamu|ini)\s+(?:adalah|:)|your\s+(?:code|otp|passcode)\s+(?:is|:)|use\s+code|enter\s+code|masukkan\s+kode|gunakan\s+kode)[\s:=#\-\.]*([0-9]{4,8})\b/i,
    // Pola angka yang diikuti keterangan verifikasi
    /\b([0-9]{4,8})\b[\s\S]{0,35}(?:is\s+your\s+(?:verification|security|login|otp|confirmation|access)\s+code|adalah\s+kode\s+(?:verifikasi|keamanan|otp|akses|masuk)|is\s+your\s+code|to\s+verify\s+your\s+account|untuk\s+verifikasi\s+akun)/i,
    // Pola label OTP/Kode murni
    /(?:one[- ]time\s+password|passcode)[\s:=#\-\.]*([0-9]{4,8})\b/i,
    /\botp[\s:=#\-\.]*([0-9]{4,8})\b/i,
    /\bkode[\s:=#\-\.]*([0-9]{4,8})\b/i,
  ];

  // Cari di Subject terlebih dahulu jika ada context kata kunci
  const hasSubjectKeyword = /(?:otp|code|kode|verif|confirm|passcode|pin|auth|security|keamanan)/i.test(subject);
  if (hasSubjectKeyword) {
    const subjMatch = cleanSubject.match(/\b([0-9]{4,8})\b/);
    if (subjMatch && !candidates.includes(subjMatch[1])) {
      candidates.push(subjMatch[1]);
    }
  }

  // Cari pola high confidence di seluruh konten bersih
  for (const regex of highConfidenceRegexes) {
    let match;
    const globalRegex = new RegExp(regex.source, 'gi');
    while ((match = globalRegex.exec(combined)) !== null) {
      const code = match[1];
      if (code && !candidates.includes(code)) {
        candidates.push(code);
      }
    }
  }

  // 2. PRIORITY TIER 2: HTML Element dengan penekanan kuat (badge, bold, code, large font)
  // Syarat: Email harus memiliki konteks verifikasi / login / akun
  const hasAuthContext = /(?:verif|aktivasi|activate|confirm|konfirmasi|login|masuk|account|akun|daftar|register|signup|sign in|security|keamanan|password|token|pin)/i.test(
    `${subject} ${text} ${html}`
  );

  if (candidates.length === 0 && hasAuthContext) {
    // Cari angka di dalam tag <code>, <strong/b>, <h1-h3>, atau inline style besar
    const htmlStructuralRegex =
      /<(?:code|strong|b|h1|h2|h3)[^>]*>[\s\r\n]*([0-9]{4,8})[\s\r\n]*<\/(?:code|strong|b|h1|h2|h3)>/gi;
    let match;
    while ((match = htmlStructuralRegex.exec(html)) !== null) {
      const code = match[1];
      if (code && !candidates.includes(code)) {
        candidates.push(code);
      }
    }
  }

  // Filter kandidat: buang jika tahun (1950-2050) atau format tidak wajar
  const validCandidates = candidates.filter((c) => {
    const num = parseInt(c, 10);
    // Tolak tahun umum
    if (c.length === 4 && num >= 1950 && num <= 2050) return false;
    // Tolak angka terlalu pendek (<4) atau terlalu panjang (>8)
    if (c.length < 4 || c.length > 8) return false;
    return true;
  });

  const primaryOtp = validCandidates.length > 0 ? validCandidates[0] : null;

  return {
    found: primaryOtp !== null,
    otp: primaryOtp,
    allCandidates: validCandidates,
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

    // Filter link tidak relevan / media / schema
    const lowerUrl = rawUrl.toLowerCase();
    if (
      lowerUrl.includes('schemas.microsoft.com') ||
      lowerUrl.includes('w3.org') ||
      lowerUrl.includes('schema.org') ||
      lowerUrl.startsWith('mailto:') ||
      lowerUrl.startsWith('javascript:') ||
      lowerUrl.endsWith('.png') ||
      lowerUrl.endsWith('.jpg') ||
      lowerUrl.endsWith('.jpeg') ||
      lowerUrl.endsWith('.gif') ||
      lowerUrl.endsWith('.svg') ||
      lowerUrl.endsWith('.css')
    ) {
      continue;
    }

    // Ambil konteks di sekitar tag ini (150 karakter sebelum dan sesudah)
    const matchIndex = anchorMatch.index;
    const surroundingSnippet = html
      .slice(Math.max(0, matchIndex - 150), matchIndex + anchorMatch[0].length + 150)
      .replace(/<[^>]*>/g, ' ');

    let score = 0;
    const lowerLabel = labelText.toLowerCase();
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
      'buka link',
      'klik di sini',
      'klik disini',
      'click here',
      'get started',
      'complete registration',
      'claim access',
      'masuk akun',
      'log in',
      'login',
      'setujui',
    ];

    for (const kw of highIntentLabelKeywords) {
      if (lowerLabel.includes(kw)) {
        score += 60;
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
      'subscribe',
      'subscription',
      'token',
      'auth',
      'magic',
      'validate',
      'action',
      'signup',
      'register',
      'access',
    ];

    for (const kw of urlIntentKeywords) {
      if (lowerUrl.includes(kw)) {
        score += 35;
        break;
      }
    }

    // Ada parameter token / kode keamanan di URL (misal ?token=... / ?code=... / ?key=...)
    if (/(?:token|code|key|auth|signature|hash|id|uuid|ticket)=/i.test(rawUrl)) {
      score += 25;
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
      score += 20;
    }

    // ==========================================
    // PENALTI: Link Unsubscribe / Social / Privacy
    // ==========================================
    const isUnsubscribe =
      lowerLabel.includes('unsubscribe') ||
      lowerLabel.includes('berhenti langganan') ||
      lowerUrl.includes('unsubscribe') ||
      lowerUrl.includes('optout') ||
      lowerUrl.includes('opt-out');

    const isPrivacyOrTerms =
      lowerLabel.includes('privacy') ||
      lowerLabel.includes('terms') ||
      lowerLabel.includes('syarat') ||
      lowerLabel.includes('ketentuan') ||
      lowerLabel.includes('kebijakan') ||
      lowerUrl.includes('privacy') ||
      lowerUrl.includes('terms');

    const isSocialMedia = /(?:facebook\.com|twitter\.com|x\.com|instagram\.com|linkedin\.com|youtube\.com|tiktok\.com)/i.test(
      lowerUrl
    );

    if (isUnsubscribe) score -= 200;
    if (isPrivacyOrTerms) score -= 150;
    if (isSocialMedia) score -= 150;

    const finalUrl = unwrapTrackingUrl(rawUrl);

    if (!seenUrls.has(finalUrl)) {
      seenUrls.add(finalUrl);
      linkCandidates.push({
        url: finalUrl,
        label: labelText || 'Buka Tautan',
        score,
        isVerification: score >= 40,
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

    if (seenUrls.has(finalUrl)) continue;

    if (
      lowerUrl.includes('schemas.microsoft.com') ||
      lowerUrl.includes('w3.org') ||
      lowerUrl.includes('schema.org') ||
      lowerUrl.endsWith('.png') ||
      lowerUrl.endsWith('.jpg')
    ) {
      continue;
    }

    let score = 20;
    if (
      /(?:verify|verifikasi|activate|aktifkan|confirm|konfirmasi|token|auth|magic|subscribe|langganan|signup)/i.test(
        lowerUrl
      )
    ) {
      score += 50;
    }
    if (/(?:token|code|key|auth)=/i.test(finalUrl)) {
      score += 30;
    }

    if (lowerUrl.includes('unsubscribe') || lowerUrl.includes('optout')) score -= 200;
    if (lowerUrl.includes('privacy') || lowerUrl.includes('terms')) score -= 150;

    seenUrls.add(finalUrl);
    linkCandidates.push({
      url: finalUrl,
      label: 'Buka Link Verifikasi',
      score,
      isVerification: score >= 40,
    });
  }

  // Urutkan berdasarkan skor tertinggi
  linkCandidates.sort((a, b) => b.score - a.score);

  const validVerificationLinks = linkCandidates.filter((l) => l.isVerification && l.score > 0);
  const primaryItem =
    validVerificationLinks.length > 0
      ? validVerificationLinks[0]
      : linkCandidates[0]?.score > 0
      ? linkCandidates[0]
      : null;

  return {
    found: primaryItem !== null,
    primaryLink: primaryItem ? primaryItem.url : null,
    primaryLabel: primaryItem ? primaryItem.label : null,
    allLinks: linkCandidates.map((l) => l.url),
  };
}
