import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UpsertSettingDto } from "./dto/upsert-setting.dto";
import { BulkUpdateSettingsDto } from "./dto/bulk-update-settings.dto";

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  /** Public: returns every setting flattened into a single { key: value } map — easy for the frontend to consume. */
  async findAllPublicMap() {
    const settings = await this.prisma.mainSetting.findMany({ orderBy: { order: "asc" } });
    const map: Record<string, string> = {};
    for (const s of settings) map[s.key] = s.value;
    return map;
  }

  findAllAdmin() {
    return this.prisma.mainSetting.findMany({ orderBy: [{ group: "asc" }, { order: "asc" }] });
  }

  async upsert(dto: UpsertSettingDto) {
    return this.prisma.mainSetting.upsert({
      where: { key: dto.key },
      create: {
        key: dto.key,
        value: dto.value,
        group: dto.group ?? "general",
        label: dto.label ?? dto.key,
        type: dto.type ?? "text",
      },
      update: {
        value: dto.value,
        group: dto.group,
        label: dto.label,
        type: dto.type,
      },
    });
  }

  async bulkUpdate(dto: BulkUpdateSettingsDto) {
    const results = await this.prisma.$transaction(
      dto.settings.map((s) =>
        this.prisma.mainSetting.upsert({
          where: { key: s.key },
          create: {
            key: s.key,
            value: s.value,
            group: s.group ?? "general",
            label: s.label ?? s.key,
            type: s.type ?? "text",
          },
          update: { value: s.value, group: s.group, label: s.label, type: s.type },
        }),
      ),
    );
    return { message: "Settings updated", count: results.length };
  }

  async remove(key: string) {
    await this.prisma.mainSetting.delete({ where: { key } });
    return { message: "Setting deleted" };
  }
}
