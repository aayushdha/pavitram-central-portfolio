import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { SERVICES, OPPORTUNITIES } from "./seed-data";
import { FAQS, TESTIMONIALS, STATS, TEAM_MEMBERS, PAGES, SETTINGS } from "./seed-data-2";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Pavitram database...");

  // ---- Super Admin ----------------------------------------------------
  const email = (process.env.SUPER_ADMIN_EMAIL || "admin@pavitramindia.com").toLowerCase();
  const phone = process.env.SUPER_ADMIN_PHONE || "9999999999";
  const password = process.env.SUPER_ADMIN_PASSWORD || "Pavitram@Admin123";
  const name = process.env.SUPER_ADMIN_NAME || "Pavitram Super Admin";

  const hashed = await bcrypt.hash(password, 10);
  await prisma.mainUser.upsert({
    where: { email },
    create: {
      name,
      email,
      phone,
      password: hashed,
      role: "SUPER_ADMIN",
      accountStatus: "ACTIVE",
      kycStatus: "VERIFIED",
      isOnboarded: true,
    },
    update: {},
  });
  console.log(`✔ Super Admin ready → ${email} / ${password}`);

  // ---- Services ---------------------------------------------------------
  for (const s of SERVICES) {
    await prisma.mainService.upsert({
      where: { slug: s.slug },
      create: s as any,
      update: s as any,
    });
  }
  console.log(`✔ Seeded ${SERVICES.length} services`);

  // ---- Opportunities ------------------------------------------------------
  for (const o of OPPORTUNITIES) {
    await prisma.mainOpportunity.upsert({
      where: { slug: o.slug },
      create: o as any,
      update: o as any,
    });
  }
  console.log(`✔ Seeded ${OPPORTUNITIES.length} opportunities`);

  // ---- FAQs ---------------------------------------------------------------
  const existingFaqs = await prisma.mainFaq.count();
  if (existingFaqs === 0) {
    await prisma.mainFaq.createMany({ data: FAQS as any });
  }
  console.log(`✔ Seeded ${FAQS.length} FAQs`);

  // ---- Testimonials ---------------------------------------------------------
  const existingTesti = await prisma.mainTestimonial.count();
  if (existingTesti === 0) {
    await prisma.mainTestimonial.createMany({ data: TESTIMONIALS as any });
  }
  console.log(`✔ Seeded ${TESTIMONIALS.length} testimonials`);

  // ---- Stats ---------------------------------------------------------------
  const existingStats = await prisma.mainStat.count();
  if (existingStats === 0) {
    await prisma.mainStat.createMany({ data: STATS as any });
  }
  console.log(`✔ Seeded ${STATS.length} stats`);

  // ---- Team members ---------------------------------------------------------
  const existingTeam = await prisma.mainTeamMember.count();
  if (existingTeam === 0) {
    await prisma.mainTeamMember.createMany({ data: TEAM_MEMBERS as any });
  }
  console.log(`✔ Seeded ${TEAM_MEMBERS.length} team member(s)`);

  // ---- CMS Pages + Sections ---------------------------------------------
  for (const p of PAGES) {
    const page = await prisma.mainPage.upsert({
      where: { slug: p.slug },
      create: {
        slug: p.slug,
        title: p.title,
        hindi: p.hindi,
        subtitle: p.subtitle,
        metaDescription: (p as any).metaDescription,
      },
      update: {
        title: p.title,
        hindi: p.hindi,
        subtitle: p.subtitle,
        metaDescription: (p as any).metaDescription,
      },
    });

    for (const s of p.sections) {
      await prisma.mainPageSection.upsert({
        where: { pageId_key: { pageId: page.id, key: s.key } },
        create: {
          pageId: page.id,
          key: s.key,
          type: s.type as any,
          title: s.title,
          hindi: s.hindi,
          subtitle: s.subtitle,
          body: s.body as any,
          order: s.order,
        },
        update: {
          type: s.type as any,
          title: s.title,
          hindi: s.hindi,
          subtitle: s.subtitle,
          body: s.body as any,
          order: s.order,
        },
      });
    }
  }
  console.log(`✔ Seeded ${PAGES.length} CMS pages with sections`);

  // ---- Settings ---------------------------------------------------------
  for (const s of SETTINGS) {
    await prisma.mainSetting.upsert({
      where: { key: s.key },
      create: s as any,
      update: s as any,
    });
  }
  console.log(`✔ Seeded ${SETTINGS.length} settings`);

  console.log("🌱 Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
