import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { CentralAuthModule } from './central-auth/central-auth.module';

import { UsersModule } from './users/users.module';
import { PropertiesModule } from './properties/properties.module';
import { ProjectsModule } from './projects/projects.module';
import { LeadsModule } from './leads/leads.module';
import { SiteVisitsModule } from './site-visits/site-visits.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { SavedSearchesModule } from './saved-searches/saved-searches.module';
import { MessagesModule } from './messages/messages.module';
import { ProvidersModule } from './providers/providers.module';
import { ServiceBookingsModule } from './service-bookings/service-bookings.module';
import { ReviewsModule } from './reviews/reviews.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AdminModule } from './admin/admin.module';
import { StorageModule } from './storage/storage.module';
import { AuthProxyModule } from './auth-proxy/auth-proxy.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 120 }]),

    // Infra (both @Global — no need to re-import elsewhere)
    PrismaModule,
    CentralAuthModule,

    // Feature modules
    UsersModule,
    PropertiesModule,
    ProjectsModule,
    LeadsModule,
    SiteVisitsModule,
    WishlistModule,
    SavedSearchesModule,
    MessagesModule,
    ProvidersModule,
    ServiceBookingsModule,
    ReviewsModule,
    SubscriptionsModule,
    NotificationsModule,
    AdminModule,
    StorageModule,
    AuthProxyModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
