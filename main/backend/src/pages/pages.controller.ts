import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from "@nestjs/common";
import { MainRole } from "@prisma/client";
import { PagesService } from "./pages.service";
import { UpsertPageDto } from "./dto/upsert-page.dto";
import { UpsertSectionDto } from "./dto/upsert-section.dto";
import { Public } from "../common/decorators/public.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";

@Controller("pages")
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Public()
  @Get(":slug")
  findOne(@Param("slug") slug: string) {
    return this.pagesService.findBySlugPublic(slug);
  }
}

@Controller("admin/pages")
@UseGuards(RolesGuard)
@Roles(MainRole.ADMIN, MainRole.SUPER_ADMIN)
export class AdminPagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Get()
  findAll() {
    return this.pagesService.findAllAdmin();
  }

  @Get(":slug")
  findOne(@Param("slug") slug: string) {
    return this.pagesService.findOneAdmin(slug);
  }

  @Put()
  upsertPage(@Body() dto: UpsertPageDto) {
    return this.pagesService.upsertPage(dto);
  }

  @Delete(":slug")
  deletePage(@Param("slug") slug: string) {
    return this.pagesService.deletePage(slug);
  }

  @Put(":slug/sections")
  upsertSection(@Param("slug") slug: string, @Body() dto: UpsertSectionDto) {
    return this.pagesService.upsertSection(slug, dto);
  }

  @Post(":slug/sections")
  createSection(@Param("slug") slug: string, @Body() dto: UpsertSectionDto) {
    return this.pagesService.upsertSection(slug, dto);
  }

  @Delete("sections/:sectionId")
  deleteSection(@Param("sectionId") sectionId: string) {
    return this.pagesService.deleteSection(sectionId);
  }
}
