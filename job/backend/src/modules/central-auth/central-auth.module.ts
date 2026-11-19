import { Module } from '@nestjs/common';
import { CentralAuthService } from './central-auth.service';

@Module({
  providers: [CentralAuthService],
  exports: [CentralAuthService],
})
export class CentralAuthModule {}
