import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { MainRole } from "@prisma/client";
import { FaqsService } from "./faqs.service";
import { CreateFaqDto } from "./dto/create-faq.dto";
import { UpdateFaqDto } from "./dto/update-faq.dto";
import { Public } from "../common/decorators/public.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";

@Controller("faqs")
export class FaqsController {
  constructor(private readonly faqsService: FaqsService) {}

  @Public()
  @Get()
  findAll() {
    return this.faqsService.findAllPublic();
  }
}

@Controller("admin/faqs")
@UseGuards(RolesGuard)
@Roles(MainRole.ADMIN, MainRole.SUPER_ADMIN)
export class AdminFaqsController {
  constructor(private readonly faqsService: FaqsService) {}

  @Get()
  findAll() {
    return this.faqsService.findAllAdmin();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.faqsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateFaqDto) {
    return this.faqsService.create(dto);
  }

  @Patch("reorder")
  reorder(@Body("items") items: { id: string; order: number }[]) {
    return this.faqsService.reorder(items);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateFaqDto) {
    return this.faqsService.update(id, dto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.faqsService.remove(id);
  }
}
