import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuid } from 'uuid';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly endpoint: string;
  private readonly publicUrl: string;

  constructor(private readonly config: ConfigService) {
    this.bucket = this.config.get<string>('AWS_BUCKET_NAME');
    this.endpoint = this.config.get<string>('AWS_ENDPOINT_URL');
    this.publicUrl = this.config.get<string>('AWS_PUBLIC_URL') || this.endpoint;

    this.s3 = new S3Client({
      region: this.config.get<string>('AWS_DEFAULT_REGION') || 'us-east-1',
      endpoint: this.endpoint,
      forcePathStyle: this.config.get<string>('AWS_S3_FORCE_PATH_STYLE') !== 'false',
      credentials: {
        accessKeyId: this.config.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.config.get<string>('AWS_SECRET_ACCESS_KEY'),
      },
    });
  }

  async uploadFile(file: Express.Multer.File, folder = 'uploads'): Promise<{ key: string; url: string }> {
    const ext = file.originalname?.includes('.') ? file.originalname.split('.').pop() : '';
    const key = `${folder}/${Date.now()}-${uuid()}${ext ? `.${ext}` : ''}`;

    try {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );
    } catch (e) {
      // Log the full AWS/MinIO error server-side (this is where credential,
      // clock-skew, or endpoint mismatches actually show up) but never leak
      // the raw SDK error to the client — it's not something the person
      // uploading a KYC document can act on, and it can look like a
      // validation error on their file when it's really a server/storage
      // configuration problem.
      this.logger.error(
        `S3/MinIO upload failed for key "${key}" (bucket=${this.bucket}, endpoint=${this.endpoint}): ${e?.name || ''} ${e?.message || e}`,
      );
      throw new ServiceUnavailableException(
        'File storage is temporarily unavailable. Please try again in a moment, or contact support if this keeps happening.',
      );
    }

    const url = `${this.publicUrl.replace(/\/$/, '')}/${this.bucket}/${key}`;
    return { key, url };
  }

  async deleteFile(key: string): Promise<void> {
    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }
}
