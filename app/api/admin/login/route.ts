import { NextRequest, NextResponse } from 'next/server';
import {
  validateAdminCredentials,
  getCurrentApiKey,
  createAdminSessionToken,
} from '@/lib/auth';
import {
  checkLoginBruteForce,
  recordLoginFailure,
  resetLoginFailures,
} from '@/lib/rateLimiter';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // 1. Anti Brute-Force Check
    const bruteStatus = checkLoginBruteForce(req);
    if (bruteStatus.isLocked) {
      const minutesLeft = Math.ceil(bruteStatus.lockRemainingMs / (60 * 1000));
      return NextResponse.json(
        {
          error: `Terlalu banyak percobaan gagal. Akses login dikunci sementara selama ${minutesLeft} menit demi keamanan.`,
          locked: true,
          minutesLeft,
        },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const username = body.username?.trim();
    const password = body.password?.trim();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username dan password wajib diisi' },
        { status: 400 }
      );
    }

    // 2. Validate Credentials (PBKDF2 Hash Safe)
    const isValid = await validateAdminCredentials(username, password);

    if (!isValid) {
      const failureResult = recordLoginFailure(req);
      if (failureResult.isLocked) {
        return NextResponse.json(
          {
            error: `Password salah 5 kali berturut-turut! IP Anda dikunci selama 15 menit.`,
            locked: true,
          },
          { status: 429 }
        );
      }

      const attemptsRemaining = 5 - (bruteStatus.remainingAttempts > 0 ? (5 - bruteStatus.remainingAttempts + 1) : 1);
      return NextResponse.json(
        {
          error: `Username atau password salah. (Sisa percobaan: ${Math.max(1, attemptsRemaining)}x)`,
          remainingAttempts: Math.max(1, attemptsRemaining),
        },
        { status: 401 }
      );
    }

    // 3. Login Success: Reset failures & create cryptographic Session Token
    resetLoginFailures(req);
    const sessionToken = createAdminSessionToken(username);
    const apiKey = await getCurrentApiKey();

    return NextResponse.json({
      success: true,
      message: 'Login Admin Berhasil',
      sessionToken,
      admin: {
        username: username,
        apiKey: apiKey,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
