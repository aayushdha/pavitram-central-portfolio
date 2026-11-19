import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { SignupProxyDto } from './dto/signup-proxy.dto';
import { SigninProxyDto } from './dto/signin-proxy.dto';

/**
 * Forwards signup/signin to the central Pavitram Auth API FROM THE SERVER
 * SIDE, instead of the browser calling `mainbackend.pavitramindia.com`
 * directly.
 *
 * Why this exists: the browser was getting a generic "failed to fetch" on
 * signup/signin even though the exact same request works fine from Postman.
 * That's the textbook signature of a CORS rejection — the central auth
 * service's CORS allow-list doesn't (yet) include this frontend's origin,
 * even though it apparently allows at least one other site's origin. A
 * server-to-server HTTP call (this file, via axios) is never subject to
 * browser CORS at all, so this sidesteps the problem completely without
 * needing the central auth service's CORS config changed.
 *
 * CONFIRMED (via `test-backend-api.sh`, live run): `/auth/signup` returns
 * only `{ message, user }` — no token at all. `signup()` below handles this
 * by immediately calling `signin()` with the same credentials afterwards so
 * callers always get a usable token back from signup either way.
 *
 * CONFIRMED (via backend logs, 20 Sep run): `/auth/signin` uses a different
 * shape than `/auth/signup` — it wants `{ identifier, password }`, where
 * `identifier` is a unified email-or-phone login field, NOT `{ email,
 * password }`. `signin()` translates for this automatically.
 */
@Injectable()
export class AuthProxyService {
  private readonly logger = new Logger(AuthProxyService.name);
  private readonly baseUrl: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.baseUrl = this.config.get<string>(
      'CENTRAL_AUTH_BASE_URL',
      'https://mainbackend.pavitramindia.com/api/v1',
    );
  }

  async signup(dto: SignupProxyDto) {
    // Confirmed via Postman AND via test-backend-api.sh: the working
    // request only sends { email, password, phone } — no `name` — so
    // that's exactly what's forwarded here (name is saved to this
    // project's own profile afterwards — see `AuthProvider.signup()` on
    // the frontend).
    const signupResult = await this.forward('post', '/auth/signup', {
      email: dto.email,
      password: dto.password,
      phone: dto.phone,
    });

    if (this.extractToken(signupResult)) {
      return signupResult;
    }

    // CONFIRMED (test-backend-api.sh, 20 Sep run): /auth/signup does NOT
    // return a token at all — only { message, user }. Sign in immediately
    // with the same credentials to actually get one, so the caller always
    // gets a usable token back from signup either way.
    const signinResult = await this.signin({ email: dto.email, password: dto.password });
    return { ...signupResult, ...signinResult };
  }

  async signin(dto: SigninProxyDto) {
    // CONFIRMED via logs (20 Sep): the central API's signin endpoint expects
    // a field called `identifier` (not `email`) — it's a unified
    // email-or-phone login field, distinct from signup's dedicated `email`
    // field. Sending `{ email, password }` here got a real, consistent
    // "identifier must be a string" 400 back.
    const centralBody = { identifier: dto.email, password: dto.password };
    try {
      return await this.forward('post', '/auth/signin', centralBody);
    } catch (err) {
      if (err instanceof HttpException && err.getStatus() === 404) {
        // Endpoint name not 100% confirmed — fall back to /auth/login.
        return this.forward('post', '/auth/login', centralBody);
      }
      throw err;
    }
  }

  private extractToken(data: unknown): string | null {
    const d = data as { access_token?: string; accessToken?: string; token?: string } | null;
    return d?.access_token ?? d?.accessToken ?? d?.token ?? null;
  }

  private async forward(method: 'post', path: string, body: unknown) {
    const redactedBody = this.redactPassword(body);
    try {
      this.logger.log(`→ ${method.toUpperCase()} ${this.baseUrl}${path} body=${JSON.stringify(redactedBody)}`);
      const response = await firstValueFrom(
        this.http.request({
          method,
          url: `${this.baseUrl}${path}`,
          data: body,
        }),
      );
      this.logger.log(`← ${response.status} from ${path}: ${JSON.stringify(response.data)}`);
      return response.data;
    } catch (err) {
      const axiosErr = err as AxiosError;
      if (axiosErr?.response) {
        this.logger.warn(
          `← ${axiosErr.response.status} from ${path}: ${JSON.stringify(axiosErr.response.data)}`,
        );
        // Pass the central auth service's own status + body straight through
        // so the frontend sees the real validation error, not a generic one.
        throw new HttpException(axiosErr.response.data ?? 'Authentication service error', axiosErr.response.status);
      }
      this.logger.warn(`Could not reach central auth service at ${path}: ${axiosErr?.message ?? err}`);
      throw new HttpException('Could not reach the authentication service. Please try again.', 502);
    }
  }

  private redactPassword(body: unknown): unknown {
    if (body && typeof body === 'object' && 'password' in body) {
      return { ...body, password: '[redacted]' };
    }
    return body;
  }
}