import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AdminDashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [
      totalUsers,
      newUsersLast30d,
      totalCommunityMembers,
      pendingCommunityMembers,
      approvedCommunityMembers,
      totalContactMessages,
      newContactMessages,
      totalServices,
      publishedServices,
      totalOpportunities,
      totalFaqs,
      totalTestimonials,
      totalTeamMembers,
      totalMedia,
    ] = await Promise.all([
      this.prisma.mainUser.count(),
      this.prisma.mainUser.count({
        where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      }),
      this.prisma.mainCommunityMember.count(),
      this.prisma.mainCommunityMember.count({ where: { status: "PENDING" } }),
      this.prisma.mainCommunityMember.count({ where: { status: "APPROVED" } }),
      this.prisma.mainContactMessage.count(),
      this.prisma.mainContactMessage.count({ where: { status: "NEW" } }),
      this.prisma.mainService.count(),
      this.prisma.mainService.count({ where: { isPublished: true } }),
      this.prisma.mainOpportunity.count(),
      this.prisma.mainFaq.count(),
      this.prisma.mainTestimonial.count(),
      this.prisma.mainTeamMember.count(),
      this.prisma.mainMedia.count(),
    ]);

    const [recentCommunity, recentMessages, recentUsers] = await Promise.all([
      this.prisma.mainCommunityMember.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
      this.prisma.mainContactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
      this.prisma.mainUser.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      }),
    ]);

    return {
      users: { total: totalUsers, newLast30Days: newUsersLast30d },
      community: {
        total: totalCommunityMembers,
        pending: pendingCommunityMembers,
        approved: approvedCommunityMembers,
      },
      messages: { total: totalContactMessages, unread: newContactMessages },
      content: {
        services: { total: totalServices, published: publishedServices },
        opportunities: totalOpportunities,
        faqs: totalFaqs,
        testimonials: totalTestimonials,
        teamMembers: totalTeamMembers,
        media: totalMedia,
      },
      recent: { community: recentCommunity, messages: recentMessages, users: recentUsers },
    };
  }
}
