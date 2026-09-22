import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { BotLog, BotActionType, BotLogStatus } from '@/lib/models/BotLog';
import { getClientIp, ApiKeyValidationResult } from '@/lib/auth';

export interface RecordBotLogParams {
  action: BotActionType;
  req?: NextRequest;
  auth?: ApiKeyValidationResult;
  keyName?: string;
  apiKeySnippet?: string;
  ip?: string;
  botId?: string;
  email?: string;
  otp?: string | null;
  link?: string | null;
  status?: BotLogStatus;
  statusCode?: number;
  message?: string;
  responseTimeMs?: number;
}

/**
 * Mask an API key string for safe log presentation (e.g. hfl_key_...2233)
 */
export function maskApiKey(key: string | null | undefined): string {
  if (!key) return '';
  const trimmed = key.trim();
  if (trimmed.length <= 8) return `${trimmed.slice(0, 3)}***`;
  return `${trimmed.slice(0, 7)}...${trimmed.slice(-4)}`;
}

/**
 * Fire-and-forget asynchronous logger for bot / script API requests
 */
export function recordBotLog(params: RecordBotLogParams): void {
  // Execute in background without blocking API response
  (async () => {
    try {
      let clientIp = params.ip;
      let botIdentifier = params.botId;
      let keySnippet = params.apiKeySnippet || '';
      let resolvedKeyName = params.keyName;

      if (params.req) {
        if (!clientIp) {
          clientIp = getClientIp(params.req);
        }
        if (!botIdentifier) {
          botIdentifier =
            params.req.headers.get('x-bot-id') ||
            params.req.headers.get('x-instance-id') ||
            '';
        }
        if (!keySnippet) {
          const rawKey =
            params.req.headers.get('x-api-key') ||
            params.req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ||
            new URL(params.req.url).searchParams.get('api_key');
          if (rawKey) {
            keySnippet = maskApiKey(rawKey);
          }
        }
      }

      if (!resolvedKeyName) {
        if (params.auth?.keyDoc?.name) {
          resolvedKeyName = params.auth.keyDoc.name;
        } else if (params.auth?.valid) {
          resolvedKeyName = 'Master API Key';
        } else {
          resolvedKeyName = 'Anonymous / Invalid';
        }
      }

      await connectToDatabase();

      await BotLog.create({
        action: params.action,
        keyName: resolvedKeyName,
        apiKeySnippet: keySnippet,
        ip: clientIp || '127.0.0.1',
        botId: botIdentifier || '',
        email: params.email || '',
        otp: params.otp ?? null,
        link: params.link ?? null,
        status: params.status || (params.statusCode && params.statusCode >= 400 ? 'error' : 'success'),
        statusCode: params.statusCode || 200,
        message: params.message || '',
        responseTimeMs: params.responseTimeMs || 0,
        createdAt: new Date(),
      });
    } catch (err) {
      // Silently log to server console to prevent unhandled rejections
      console.error('[BotLog Error]:', err);
    }
  })();
}
