import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { UpsertPageDto } from "./dto/upsert-page.dto";
import { UpsertSectionDto } from "./dto/upsert-section.dto";

@Injectable()
export class PagesService {
  constructor(private prisma: PrismaService) {}

  // ---- Public: read a page + its published sections, keyed for easy lookup

  async findBySlugPublic(slug: string) {
    const page = await this.prisma.mainPage.findUnique({
      where: { slug },
      include: { sections: { where: { isPublished: true }, orderBy: { order: "asc" } } },
    });
    if (!page) throw new NotFoundException(`Page "${slug}" not found`);

    const sections: Record<string, unknown> = {};
    for (const s of page.sections) {
      sections[s.key] = {
        id: s.id,
        type: s.type,
        title: s.title,
        hindi: s.hindi,
        subtitle: s.subtitle,
        body: s.body,
        order: s.order,
      };
    }

    return {
      slug: page.slug,
      title: page.title,
      hindi: page.hindi,
      subtitle: page.subtitle,
      metaDescription: page.metaDescription,
      sections,
      sectionsList: page.sections,
    };
  }

  // ---- Admin --------------------------------------------------------------

  findAllAdmin() {
    return this.prisma.mainPage.findMany({
      include: { _count: { select: { sections: true } } },
      orderBy: { title: "asc" },
    });
  }

  async findOneAdmin(slug: string) {
    const page = await this.prisma.mainPage.findUnique({
      where: { slug },
      include: { sections: { orderBy: { order: "asc" } } },
    });
    if (!page) throw new NotFoundException(`Page "${slug}" not found`);
    return page;
  }

  async upsertPage(dto: UpsertPageDto) {
    return this.prisma.mainPage.upsert({
      where: { slug: dto.slug },
      create: dto,
      update: {
        title: dto.title,
        hindi: dto.hindi,
        subtitle: dto.subtitle,
        metaDescription: dto.metaDescription,
      },
    });
  }

  async deletePage(slug: string) {
    const page = await this.prisma.mainPage.findUnique({ where: { slug } });
    if (!page) throw new NotFoundException(`Page "${slug}" not found`);
    await this.prisma.mainPage.delete({ where: { slug } });
    return { message: "Page deleted" };
  }

  async upsertSection(pageSlug: string, dto: UpsertSectionDto) {
    const page = await this.prisma.mainPage.findUnique({ where: { slug: pageSlug } });
    if (!page) throw new NotFoundException(`Page "${pageSlug}" not found`);

    return this.prisma.mainPageSection.upsert({
      where: { pageId_key: { pageId: page.id, key: dto.key } },
      create: {
        pageId: page.id,
        key: dto.key,
        type: dto.type ?? "CUSTOM",
        title: dto.title,
        hindi: dto.hindi,
        subtitle: dto.subtitle,
        body: (dto.body ?? {}) as Prisma.InputJsonValue,
        order: dto.order ?? 0,
        isPublished: dto.isPublished ?? true,
      },
      update: {
        type: dto.type,
        title: dto.title,
        hindi: dto.hindi,
        subtitle: dto.subtitle,
        body: dto.body as Prisma.InputJsonValue | undefined,
        order: dto.order,
        isPublished: dto.isPublished,
      },
    });
  }

  async deleteSection(sectionId: string) {
    const section = await this.prisma.mainPageSection.findUnique({ where: { id: sectionId } });
    if (!section) throw new NotFoundException("Section not found");
    await this.prisma.mainPageSection.delete({ where: { id: sectionId } });
    return { message: "Section deleted" };
  }
}
