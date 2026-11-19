import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiExcludeController } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import { Public } from './common/decorators/public.decorator';

/** Short, non-sensitive error label (e.g. ECONNREFUSED, ENOTFOUND, 28P01) — never the full message. */
function errCode(e: unknown): string {
  const x = e as { code?: string; cause?: { code?: string }; name?: string } | undefined;
  return x?.cause?.code || x?.code || x?.name || 'ERROR';
}

@ApiExcludeController()
@Controller({ path: 'health', version: '1' })
export class HealthController {
  private deepCache?: { at: number; value: Record<string, unknown> };

  constructor(
    private readonly dataSource: DataSource,
    private readonly config: ConfigService,
  ) {}

  @Public()
  @Get()
  check() {
    return { status: 'ok', service: 'jobportal-backend', time: new Date().toISOString() };
  }

  /**
   * Deep check used by the /status page and tests/smoke-test.mjs:
   * can this container talk to Postgres and to the Central Auth API? Only booleans/short codes are returned.
   * Central Auth is probed with a fake login (no account is created or changed).
   */
  @Public()
  @Get('deep')
  async deep() {
    // Public endpoint that calls Central Auth, so answer from a 10 s cache instead of hitting it on every request.
    if (this.deepCache && Date.now() - this.deepCache.at < 10_000) return this.deepCache.value;

    const database: { ok: boolean; error?: string } = { ok: false };
    try {
      await this.dataSource.query('SELECT 1');
      database.ok = true;
    } catch (e) {
      database.error = errCode(e);
    }

    const centralAuth: { ok: boolean; status?: number; error?: string } = { ok: false };
    const base = this.config.get<string>('centralAuth.baseUrl');
    try {
      const r = await fetch(`${base}/auth/signin`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ identifier: 'health-check@example.invalid', password: 'health-check-0' }),
        signal: AbortSignal.timeout(8000),
      });
      centralAuth.status = r.status;
      centralAuth.ok = r.status < 500; // 400/401/404 = reachable and answering
    } catch (e) {
      centralAuth.error = errCode(e);
    }

    const value = {
      status: database.ok && centralAuth.ok ? 'ok' : 'degraded',
      service: 'jobportal-backend',
      jwtSecretConfigured: (process.env.JWT_SECRET || '').length >= 32,
      database,
      centralAuth,
      time: new Date().toISOString(),
    };
    this.deepCache = { at: Date.now(), value };
    return value;
  }
}
