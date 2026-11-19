import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CentralAuthService } from './central-auth.service';

// Global so any feature module can use CentralAuthGuard / RolesGuard without
// having to import this module explicitly.
@Global()
@Module({
  imports: [ConfigModule, HttpModule.register({ timeout: 8000, maxRedirects: 3 })],
  providers: [CentralAuthService],
  exports: [CentralAuthService],
})
export class CentralAuthModule {}
