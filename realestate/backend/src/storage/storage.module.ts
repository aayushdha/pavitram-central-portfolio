import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { StorageController } from './storage.controller';
import { MinioService } from './minio.service';

@Module({
  imports: [
    MulterModule.register({
      // Keep uploads in memory (not written to disk) — this backend has no
      // persistent local disk in production (containers are stateless), and
      // files are small (8MB cap) so this is fine.
      limits: { fileSize: 8 * 1024 * 1024 },
    }),
  ],
  controllers: [StorageController],
  providers: [MinioService],
})
export class StorageModule {}
