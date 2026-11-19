import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateTestimonialDto } from "./dto/create-testimonial.dto";
import { UpdateTestimonialDto } from "./dto/update-testimonial.dto";

@Injectable()
export class TestimonialsService {
  constructor(private prisma: PrismaService) {}

  findAllPublic() {
    return this.prisma.mainTestimonial.findMany({
      where: { isPublished: true },
      orderBy: { order: "asc" },
    });
  }

  findAllAdmin() {
    return this.prisma.mainTestimonial.findMany({ orderBy: { order: "asc" } });
  }

  async findOne(id: string) {
    const item = await this.prisma.mainTestimonial.findUnique({ where: { id } });
    if (!item) throw new NotFoundException("Testimonial not found");
    return item;
  }

  create(dto: CreateTestimonialDto) {
    return this.prisma.mainTestimonial.create({ data: dto });
  }

  async update(id: string, dto: UpdateTestimonialDto) {
    await this.findOne(id);
    return this.prisma.mainTestimonial.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.mainTestimonial.delete({ where: { id } });
    return { message: "Testimonial deleted" };
  }

  async reorder(items: { id: string; order: number }[]) {
    await this.prisma.$transaction(
      items.map((it) =>
        this.prisma.mainTestimonial.update({ where: { id: it.id }, data: { order: it.order } }),
      ),
    );
    return { message: "Order updated" };
  }
}
