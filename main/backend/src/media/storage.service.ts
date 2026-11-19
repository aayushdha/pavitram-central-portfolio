import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { extname } from "path";

/**
 * Thin wrapper around the AWS S3 SDK, configured to talk to any
 * S3-compatible storage — including a self-hosted MinIO bucket.
 *
 * All keys are written under STORAGE_PREFIX (default "pavitram") so that a
 * shared bucket used by other projects is never touched outside that
 * namespace — nothing here can read, list, or delete objects outside of it.
 */
@Injectable()
export class StorageService {
  private readonly logger = new Logger("StorageService");
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly prefix: string;
  private readonly publicUrlBase: string;

  constructor(private config: ConfigService) {
    const endpoint = this.config.get<string>("AWS_ENDPOINT_URL");
    const region = this.config.get<string>("AWS_DEFAULT_REGION") || "us-east-1";
    const accessKeyId = (this.config.get<string>("AWS_ACCESS_KEY_ID") || "").trim();
    const secretAccessKey = (this.config.get<string>("AWS_SECRET_ACCESS_KEY") || "").trim();
    const forcePathStyle = (this.config.get<string>("AWS_S3_FORCE_PATH_STYLE") || "true") === "true";

    this.bucket = (this.config.get<string>("AWS_BUCKET_NAME") || "").trim();
    this.prefix = (this.config.get<string>("STORAGE_PREFIX") || "pavitram").replace(/^\/|\/$/g, "");

    const explicitPublicUrl = (this.config.get<string>("AWS_PUBLIC_URL") || "").trim();
    this.publicUrlBase = explicitPublicUrl
      ? explicitPublicUrl.replace(/\/$/, "")
      : `${(endpoint || "").replace(/\/$/, "")}/${this.bucket}`;

    this.client = new S3Client({
      endpoint,
      region,
      forcePathStyle,
      credentials: { accessKeyId, secretAccessKey },
    });
  }

  async upload(file: Express.Multer.File): Promise<{ key: string; url: string }> {
    const unique = `${Date.now()}-${randomUUID()}${extname(file.originalname)}`;
    const key = `${this.prefix}/${unique}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    const url = `${this.publicUrlBase}/${key}`;
    this.logger.log(`Uploaded ${key} to bucket ${this.bucket}`);
    return { key, url };
  }

  async remove(key: string): Promise<void> {
    try {
      await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
    } catch (err) {
      this.logger.warn(`Could not delete ${key} from bucket ${this.bucket}: ${(err as Error).message}`);
    }
  }

  /** Extracts the storage key back out of a stored public URL, for deletion. */
  keyFromUrl(url: string): string {
    const idx = url.indexOf(`${this.prefix}/`);
    return idx >= 0 ? url.slice(idx) : url;
  }
}
