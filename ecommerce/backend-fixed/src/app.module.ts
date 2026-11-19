import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { StorageModule } from './storage/storage.module';
import { UsersModule } from './users/users.module';

import { CategoriesModule } from './categories/categories.module';
import { BannersModule } from './banners/banners.module';
import { CouponsModule } from './coupons/coupons.module';
import { SupportTicketsModule } from './support-tickets/support-tickets.module';
import { NotificationRulesModule } from './notification-rules/notification-rules.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { SecuritySettingsModule } from './security-settings/security-settings.module';
import { ActivityLogsModule } from './activity-logs/activity-logs.module';
import { GstSummaryModule } from './gst-summary/gst-summary.module';
import { HeroStatsModule } from './hero-stats/hero-stats.module';
import { GmvTrendsModule } from './gmv-trends/gmv-trends.module';
import { CohortsModule } from './cohorts/cohorts.module';
import { VendorScorecardsModule } from './vendor-scorecards/vendor-scorecards.module';
import { LanguagesModule } from './languages/languages.module';
import { SavedAddressesModule } from './saved-addresses/saved-addresses.module';
import { CreditNotesModule } from './credit-notes/credit-notes.module';
import { B2bInvoicesModule } from './b2b-invoices/b2b-invoices.module';
import { SampleOrdersModule } from './sample-orders/sample-orders.module';
import { ReceivablesModule } from './receivables/receivables.module';
import { ContractPricingModule } from './contract-pricing/contract-pricing.module';
import { TeamMembersModule } from './team-members/team-members.module';
import { RfqsModule } from './rfqs/rfqs.module';

// PART 2 modules
import { ProductsModule } from './products/products.module';
import { VendorsModule } from './vendors/vendors.module';
import { VendorReviewsModule } from './vendor-reviews/vendor-reviews.module';
import { BusinessBuyersModule } from './business-buyers/business-buyers.module';
import { OrdersModule } from './orders/orders.module';
import { CartModule } from './cart/cart.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { ChatModule } from './chat/chat.module';
import { SiteContentModule } from './site-content/site-content.module';

// Part 3 modules — Loyalty/Referral, Commission & Payout Engine, Disputes,
// Returns/Refunds, and wishlist price-drop alerts (extends WishlistModule).
import { LoyaltyModule } from './loyalty/loyalty.module';
import { CommissionsModule } from './commissions/commissions.module';
import { DisputesModule } from './disputes/disputes.module';
import { ReturnsModule } from './returns/returns.module';

// Part 4 — GST auto-calculation engine, custom report builder
import { GstModule } from './gst/gst.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    StorageModule,
    UsersModule,

    // Part 1
    CategoriesModule,
    BannersModule,
    CouponsModule,
    SupportTicketsModule,
    NotificationRulesModule,
    IntegrationsModule,
    SecuritySettingsModule,
    ActivityLogsModule,
    GstSummaryModule,
    HeroStatsModule,
    GmvTrendsModule,
    CohortsModule,
    VendorScorecardsModule,
    LanguagesModule,
    SavedAddressesModule,
    CreditNotesModule,
    B2bInvoicesModule,
    SampleOrdersModule,
    ReceivablesModule,
    ContractPricingModule,
    TeamMembersModule,
    RfqsModule,

    // Part 2
    ProductsModule,
    VendorsModule,
    VendorReviewsModule,
    BusinessBuyersModule,
    OrdersModule,
    CartModule,
    WishlistModule,
    ChatModule,
    SiteContentModule,

    // Part 3
    LoyaltyModule,
    CommissionsModule,
    DisputesModule,
    ReturnsModule,

    // Part 4
    GstModule,
    ReportsModule,
  ],
})
export class AppModule {}
