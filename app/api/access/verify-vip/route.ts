import { NextRequest, NextResponse } from 'next/server';
import { getAdminCredentials, verifyPassword, createVipSessionToken } from '@/lib/auth';
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
          error: `Terlalu banyak percobaan gagal. Silakan coba lagi dalam ${minutesLeft} menit.`,
          locked: true,
          minutesLeft,
        },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const cdk = body.cdk?.trim();

    if (!cdk) {
      return NextResponse.json(
        { error: 'Kode CDK / Passcode wajib diisi' },
        { status: 400 }
      );
    }

    // 2. Validate CDK against synced Admin Password
    const creds = await getAdminCredentials();
    const isValid = verifyPassword(cdk, creds.passwordRawOrHash);

    if (!isValid) {
      const failureResult = recordLoginFailure(req);
      if (failureResult.isLocked) {
        return NextResponse.json(
          {
            error: `Kode CDK salah 5 kali berturut-turut! Akses dikunci sementara selama 15 menit.`,
            locked: true,
          },
          { status: 429 }
        );
      }

      const attemptsRemaining = Math.max(1, bruteStatus.remainingAttempts - 1);
      return NextResponse.json(
        {
          error: `Kode CDK tidak valid! (Sisa percobaan: ${attemptsRemaining}x)`,
          remainingAttempts: attemptsRemaining,
        },
        { status: 401 }
      );
    }

    // 3. Success: Reset rate-limit failures & generate signed token
    resetLoginFailures(req);
    const vipToken = createVipSessionToken();

    return NextResponse.json({
      success: true,
      message: 'Akses Domain VIP Berhasil Diaktifkan!',
      token: vipToken,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan sistem saat memverifikasi CDK' },
      { status: 500 }
    );
  }
}
