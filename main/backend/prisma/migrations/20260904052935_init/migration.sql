-- CreateEnum
CREATE TYPE "MainRole" AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "MainAccountStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "MainKycStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "MainCommunityStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "MainMessageStatus" AS ENUM ('NEW', 'READ', 'RESOLVED');

-- CreateEnum
CREATE TYPE "MainSectionType" AS ENUM ('HERO', 'RICH_TEXT', 'ICON_CARDS', 'STEP_LIST', 'STATS', 'CTA', 'GALLERY', 'CUSTOM');

-- CreateTable
CREATE TABLE "main_users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "MainRole" NOT NULL DEFAULT 'USER',
    "avatarUrl" TEXT,
    "accountStatus" "MainAccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "kycStatus" "MainKycStatus" NOT NULL DEFAULT 'PENDING',
    "isOnboarded" BOOLEAN NOT NULL DEFAULT false,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "profession" TEXT,
    "designation" TEXT,
    "organization" TEXT,
    "reference" TEXT,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "main_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "main_community_members" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "mobileNumber" TEXT NOT NULL,
    "profession" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "organization" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "reference" TEXT,
    "status" "MainCommunityStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "main_community_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "main_contact_messages" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "MainMessageStatus" NOT NULL DEFAULT 'NEW',
    "resolvedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "main_contact_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "main_services" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hindi" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "heroIcon" TEXT NOT NULL DEFAULT 'Sparkles',
    "aboutTitle" TEXT NOT NULL,
    "aboutP1" TEXT NOT NULL,
    "aboutP2" TEXT NOT NULL,
    "pills" JSONB NOT NULL DEFAULT '[]',
    "whyUs" JSONB NOT NULL DEFAULT '[]',
    "features" JSONB NOT NULL DEFAULT '[]',
    "steps" JSONB NOT NULL DEFAULT '[]',
    "dashboardDescription" TEXT NOT NULL DEFAULT '',
    "dashboardHref" TEXT NOT NULL DEFAULT '',
    "dashboardExternal" BOOLEAN NOT NULL DEFAULT false,
    "dashboardSso" BOOLEAN NOT NULL DEFAULT false,
    "dashboardAccent" TEXT NOT NULL DEFAULT 'from-gold/20 to-transparent',
    "showOnDashboard" BOOLEAN NOT NULL DEFAULT true,
    "metaDescription" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "main_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "main_opportunities" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "hindi" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT 'Sparkles',
    "intro" TEXT NOT NULL,
    "benefits" JSONB NOT NULL DEFAULT '[]',
    "steps" JSONB NOT NULL DEFAULT '[]',
    "metaDescription" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "main_opportunities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "main_faqs" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'General',
    "order" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "main_faqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "main_testimonials" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT,
    "quote" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "main_testimonials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "main_team_members" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT,
    "bio" TEXT,
    "avatarUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "main_team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "main_stats" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "icon" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "main_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "main_pages" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "hindi" TEXT,
    "subtitle" TEXT,
    "metaDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "main_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "main_page_sections" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "type" "MainSectionType" NOT NULL DEFAULT 'CUSTOM',
    "title" TEXT,
    "hindi" TEXT,
    "subtitle" TEXT,
    "body" JSONB NOT NULL DEFAULT '{}',
    "order" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "main_page_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "main_settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL DEFAULT '',
    "group" TEXT NOT NULL DEFAULT 'general',
    "label" TEXT NOT NULL DEFAULT '',
    "type" TEXT NOT NULL DEFAULT 'text',
    "order" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "main_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "main_media" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimetype" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "uploadedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "main_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "main_audit_logs" (
    "id" TEXT NOT NULL,
    "adminId" TEXT,
    "adminName" TEXT NOT NULL DEFAULT '',
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "changes" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "main_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "main_users_email_key" ON "main_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "main_users_phone_key" ON "main_users"("phone");

-- CreateIndex
CREATE INDEX "main_community_members_status_idx" ON "main_community_members"("status");

-- CreateIndex
CREATE INDEX "main_contact_messages_status_idx" ON "main_contact_messages"("status");

-- CreateIndex
CREATE UNIQUE INDEX "main_services_slug_key" ON "main_services"("slug");

-- CreateIndex
CREATE INDEX "main_services_order_idx" ON "main_services"("order");

-- CreateIndex
CREATE UNIQUE INDEX "main_opportunities_slug_key" ON "main_opportunities"("slug");

-- CreateIndex
CREATE INDEX "main_opportunities_order_idx" ON "main_opportunities"("order");

-- CreateIndex
CREATE INDEX "main_faqs_order_idx" ON "main_faqs"("order");

-- CreateIndex
CREATE INDEX "main_testimonials_order_idx" ON "main_testimonials"("order");

-- CreateIndex
CREATE INDEX "main_team_members_order_idx" ON "main_team_members"("order");

-- CreateIndex
CREATE INDEX "main_stats_order_idx" ON "main_stats"("order");

-- CreateIndex
CREATE UNIQUE INDEX "main_pages_slug_key" ON "main_pages"("slug");

-- CreateIndex
CREATE INDEX "main_page_sections_pageId_order_idx" ON "main_page_sections"("pageId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "main_page_sections_pageId_key_key" ON "main_page_sections"("pageId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "main_settings_key_key" ON "main_settings"("key");

-- CreateIndex
CREATE INDEX "main_settings_group_idx" ON "main_settings"("group");

-- CreateIndex
CREATE INDEX "main_audit_logs_entityType_entityId_idx" ON "main_audit_logs"("entityType", "entityId");

-- AddForeignKey
ALTER TABLE "main_community_members" ADD CONSTRAINT "main_community_members_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "main_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "main_contact_messages" ADD CONSTRAINT "main_contact_messages_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "main_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "main_page_sections" ADD CONSTRAINT "main_page_sections_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "main_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "main_media" ADD CONSTRAINT "main_media_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "main_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "main_audit_logs" ADD CONSTRAINT "main_audit_logs_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "main_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
