import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";

import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { CommunityModule } from "./community/community.module";
import { ContactModule } from "./contact/contact.module";
import { ServicesModule } from "./services/services.module";
import { OpportunitiesModule } from "./opportunities/opportunities.module";
import { FaqsModule } from "./faqs/faqs.module";
import { TestimonialsModule } from "./testimonials/testimonials.module";
import { TeamModule } from "./team/team.module";
import { StatsModule } from "./stats/stats.module";
import { PagesModule } from "./pages/pages.module";
import { SettingsModule } from "./settings/settings.module";
import { MediaModule } from "./media/media.module";
import { AdminDashboardModule } from "./admin-dashboard/admin-dashboard.module";

import { JwtAuthGuard } from "./common/guards/jwt-auth.guard";
import { RolesGuard } from "./common/guards/roles.guard";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 120 }]),
    PrismaModule,

    // Auth & identity
    AuthModule,
    UsersModule,

    // Community & inbound leads
    CommunityModule,
    ContactModule,

    // CMS / content that powers the public site & is editable from Super Admin
    ServicesModule,
    OpportunitiesModule,
    FaqsModule,
    TestimonialsModule,
    TeamModule,
    StatsModule,
    PagesModule,
    SettingsModule,
    MediaModule,

    // Super Admin dashboard
    AdminDashboardModule,
  ],
  providers: [
    // 1) Rate limiting on every route
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    // 2) Authentication — every route requires a valid JWT unless @Public()
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    // 3) Authorization — enforces @Roles(...) where present
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
