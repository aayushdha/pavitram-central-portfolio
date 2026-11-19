import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client as MinioClient } from 'minio';
import { randomUUID } from 'crypto';

/**
 * Wraps the MinIO JS client. Reuses the SAME MinIO instance the rest of the
 * VPS already runs (see DEPLOY_GUIDE.md — "Existing shared MinIO"), just a
 * dedicated bucket (`MINIO_BUCKET`, default `realestate`) so images don't
 * mix with other projects' data.
 *
 * The bucket does NOT need to be public — `StorageController` proxies
 * downloads through this backend (`GET /storage/file/:key`), so no extra
 * nginx/DNS setup is required to serve images.
 */
@Injectable()
export class MinioService implements OnModuleInit {
  private readonly logger = new Logger(MinioService.name);
  private readonly client: MinioClient;
  private readonly bucket: string;

  constructor(private readonly config: ConfigService) {
    this.bucket = this.config.get<string>('MINIO_BUCKET', 'realestate');
    this.client = new MinioClient({
      endPoint: this.config.get<string>('MINIO_ENDPOINT', 'host.docker.internal'),
      port: Number(this.config.get<string>('MINIO_PORT', '9000')),
      useSSL: this.config.get<string>('MINIO_USE_SSL', 'false') === 'true',
      accessKey: this.config.get<string>('MINIO_ACCESS_KEY', ''),
      secretKey: this.config.get<string>('MINIO_SECRET_KEY', ''),
    });
  }

  async onModuleInit() {
    try {
      const exists = await this.client.bucketExists(this.bucket);
      if (!exists) {
        await this.client.makeBucket(this.bucket);
        this.logger.log(`Created MinIO bucket "${this.bucket}"`);
      }
    } catch (err) {
      // Don't crash the whole backend if MinIO is briefly unreachable at
      // boot — uploads will just fail until it recovers, everything else
      // (properties, leads, auth, etc.) keeps working.
      this.logger.warn(`Could not verify/create MinIO bucket "${this.bucket}" at startup: ${err}`);
    }
  }

  /** Uploads a buffer, returns the object key to store (not a URL — see StorageController). */
  async upload(buffer: Buffer, originalName: string, mimeType: string): Promise<string> {
    const ext = originalName.includes('.') ? originalName.split('.').pop() : undefined;
    const key = `${randomUUID()}${ext ? `.${ext}` : ''}`;
    await this.client.putObject(this.bucket, key, buffer, buffer.length, {
      'Content-Type': mimeType,
    });
    return key;
  }

  async getObjectStream(key: string) {
    return this.client.getObject(this.bucket, key);
  }

  async statObject(key: string) {
    return this.client.statObject(this.bucket, key);
  }
}
