import { HttpService } from '@nestjs/axios';
import { BadGatewayException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';

export interface CentralAuthUser {
  userId: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
}

/** Raw shape actually returned by the central auth API — confirmed via Postman
 * to use `id`, not `userId`, on the user object (see /auth/signup response). */
interface RawCentralAuthUser {
  id?: string;
  userId?: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
}

interface CacheEntry {
  value: CentralAuthUser;
  expiresAt: number;
}

/**
 * Talks to the central Pavitram Auth API (mainbackend.pavitramindia.com).
 *
 * This service NEVER handles signup/signin/passwords — those endpoints live
 * on the central auth service and the frontend calls them directly. All this
 * service does is take the `access_token` the client already has and confirm
 * with the central API (`GET /auth/me`) that it is still valid, so we know
 * who is making the request.
 *
 * A tiny in-memory TTL cache avoids hammering the central API on every
 * request while still picking up suspensions/expirations quickly (default
 * 60s, configurable via CENTRAL_AUTH_CACHE_TTL_MS).
 */
@Injectable()
export class CentralAuthService {
  private readonly logger = new Logger(CentralAuthService.name);
  private readonly cache = new Map<string, CacheEntry>();
  private readonly baseUrl: string;
  private readonly cacheTtlMs: number;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.baseUrl = (
      this.config.get<string>('CENTRAL_AUTH_BASE_URL') ??
      'https://mainbackend.pavitramindia.com/api/v1'
    ).replace(/\/+$/, '');
    this.cacheTtlMs = Number(this.config.get('CENTRAL_AUTH_CACHE_TTL_MS') ?? 60000);
  }

  /**
   * Verifies a raw bearer token (without the "Bearer " prefix) against the
   * central auth API's `/auth/me`. Throws UnauthorizedException on any
   * failure (missing/expired/invalid token, suspended account, network
   * error) — callers should treat this uniformly as "not authenticated".
   */
  async verifyToken(token: string): Promise<CentralAuthUser> {
    if (!token) {
      throw new UnauthorizedException('Missing access token');
    }

    const cached = this.cache.get(token);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value;
    }

    try {
      const response = await firstValueFrom(
        this.http.get<{ message: string; user: RawCentralAuthUser }>(
          `${this.baseUrl}/auth/me`,
          { headers: { Authorization: `Bearer ${token}` } },
        ),
      );

      const raw = response.data?.user;
      // The real API returns the user's id as `id`, not `userId` — accept
      // either so this doesn't silently break again if that ever changes.
      const userId = raw?.userId ?? raw?.id;
      if (!userId || !raw?.email) {
        this.logger.warn(
          `Malformed /auth/me response from central auth: ${JSON.stringify(response.data)}`,
        );
        throw new BadGatewayException(
          "The auth service's /auth/me response didn't include the expected id/email fields",
        );
      }
      const user: CentralAuthUser = { userId, email: raw.email, role: raw.role };

      this.cache.set(token, { value: user, expiresAt: Date.now() + this.cacheTtlMs });
      // Opportunistically evict expired entries so the map doesn't grow forever.
      if (this.cache.size > 5000) this.evictExpired();

      return user;
    } catch (err) {
      if (err instanceof BadGatewayException) throw err;
      const axiosErr = err as AxiosError;
      if (axiosErr?.response?.status === 401) {
        throw new UnauthorizedException('Invalid or expired access token');
      }
      this.logger.warn(
        `Central auth verification failed: ${axiosErr?.message ?? err}` +
          (axiosErr?.response?.data
            ? ` — response: ${JSON.stringify(axiosErr.response.data)}`
            : ''),
      );
      throw new UnauthorizedException('Could not verify access token');
    }
  }

  /** Drop a token from the cache, e.g. after a client-initiated logout. */
  invalidate(token: string) {
    this.cache.delete(token);
  }

  private evictExpired() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt <= now) this.cache.delete(key);
    }
  }
}
