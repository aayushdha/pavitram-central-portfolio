import { BadGatewayException, HttpException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  CentralErrorBody,
  CentralMeResponse,
  CentralProfileUpdateResponse,
  CentralSigninResponse,
  CentralSignupResponse,
} from './central-auth.types';

export interface CentralSignupDto {
  email: string;
  password: string;
  phone: string;
}

export interface CentralSigninDto {
  identifier: string;
  password: string;
}

export interface CentralProfileUpdateDto {
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  profession?: string;
  designation?: string;
  organization?: string;
}

/**
 * Thin client around the Pavitram Central Auth API
 * (https://mainbackend.pavitramindia.com/api/v1).
 *
 * This service is the ONLY place in the codebase that talks to the central
 * auth backend directly — signup and login are not implemented locally,
 * they are proxied here. See AUTH_API_INTEGRATION.md for the upstream contract.
 */
@Injectable()
export class CentralAuthService {
  private readonly logger = new Logger(CentralAuthService.name);
  private readonly client: AxiosInstance;

  constructor(private readonly config: ConfigService) {
    this.client = axios.create({
      baseURL: this.config.get<string>('centralAuth.baseUrl'),
      timeout: 15000,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  async signup(dto: CentralSignupDto): Promise<CentralSignupResponse> {
    return this.request<CentralSignupResponse>('post', '/auth/signup', dto);
  }

  async signin(dto: CentralSigninDto): Promise<CentralSigninResponse> {
    return this.request<CentralSigninResponse>('post', '/auth/signin', dto);
  }

  async validateToken(accessToken: string): Promise<CentralMeResponse> {
    return this.request<CentralMeResponse>('get', '/auth/me', undefined, accessToken);
  }

  async updateProfile(
    accessToken: string,
    dto: CentralProfileUpdateDto,
  ): Promise<CentralProfileUpdateResponse> {
    return this.request<CentralProfileUpdateResponse>('patch', '/auth/profile', dto, accessToken);
  }

  private async request<T>(
    method: 'get' | 'post' | 'patch',
    path: string,
    data?: unknown,
    bearerToken?: string,
  ): Promise<T> {
    try {
      const response = await this.client.request<T>({
        method,
        url: path,
        data,
        headers: bearerToken ? { Authorization: `Bearer ${bearerToken}` } : undefined,
      });
      return response.data;
    } catch (err) {
      this.rethrow(err as AxiosError<CentralErrorBody>, path);
    }
  }

  private rethrow(err: AxiosError<CentralErrorBody>, path: string): never {
    if (err.response) {
      const body = err.response.data;
      const message = body?.message || `Central auth request to ${path} failed`;
      // Re-throw with the SAME status code the central API gave us (401, 409, etc.)
      // so callers (our own controllers) can map it 1:1.
      throw new HttpException(
        { message, error: body?.error || 'CentralAuthError' },
        err.response.status,
      );
    }

    this.logger.error(`Central auth service unreachable at ${path}: ${err.message}`);
    throw new BadGatewayException(
      'Could not reach the central authentication service. Please try again shortly.',
    );
  }
}
