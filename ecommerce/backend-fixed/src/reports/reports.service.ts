import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// Doc §1.6 "Custom Report Builder": admin can export any of the platform's
// analytics/operational tables as CSV, with a date-range filter where it
// makes sense. This is the CSV-export half of that feature — scheduled
// email delivery of reports is not included here (that needs the
// notification-sending infrastructure tracked separately).
const EXPORTABLE_ENTITIES = {
  orders: { model: 'order' as const, dateField: 'createdAt' as const },
  disputes: { model: 'dispute' as const, dateField: 'createdAt' as const },
  returns: { model: 'returnRequest' as const, dateField: 'createdAt' as const },
  payouts: { model: 'payout' as const, dateField: 'createdAt' as const },
  commissionRules: { model: 'commissionRule' as const, dateField: 'createdAt' as const },
  gmvTrends: { model: 'gmvTrend' as const, dateField: null },
  vendorScorecards: { model: 'vendorScorecard' as const, dateField: null },
  vendors: { model: 'vendor' as const, dateField: 'createdAt' as const },
  products: { model: 'product' as const, dateField: 'createdAt' as const },
  supportTickets: { model: 'supportTicket' as const, dateField: 'createdAt' as const },
  activityLogs: { model: 'activityLog' as const, dateField: 'createdAt' as const },
  // Added to back the admin Analytics "Custom report builder" and the
  // Tax & Audit "Data retention & regulatory reports" export buttons.
  gstSummary: { model: 'gstSummary' as const, dateField: null },
  cohorts: { model: 'cohort' as const, dateField: null },
  businessBuyers: { model: 'businessBuyer' as const, dateField: 'createdAt' as const },
};

export type ExportableEntity = keyof typeof EXPORTABLE_ENTITIES;

function toCsvValue(value: any): string {
  if (value === null || value === undefined) return '';
  const str = typeof value === 'object' ? JSON.stringify(value) : String(value);
  // Escape quotes/commas/newlines per standard CSV rules
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

function toCsv(rows: Record<string, any>[]): string {
  if (rows.length === 0) return '';
  const columnSet = new Set<string>();
  for (const row of rows) {
    for (const key of Object.keys(row)) columnSet.add(key);
  }
  const columns: string[] = Array.from(columnSet);
  const header = columns.join(',');
  const lines = rows.map((row) => columns.map((col) => toCsvValue(row[col])).join(','));
  return [header, ...lines].join('\n');
}

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  listEntities() {
    return Object.keys(EXPORTABLE_ENTITIES);
  }

  async export(entity: string, params: { from?: string; to?: string } = {}): Promise<{ filename: string; csv: string }> {
    const config = EXPORTABLE_ENTITIES[entity as ExportableEntity];
    if (!config) {
      throw new BadRequestException(`Unknown report entity "${entity}". Valid options: ${this.listEntities().join(', ')}`);
    }

    const where: any = {};
    if (config.dateField && (params.from || params.to)) {
      where[config.dateField] = {
        ...(params.from ? { gte: new Date(params.from) } : {}),
        ...(params.to ? { lte: new Date(params.to) } : {}),
      };
    }

    const rows = await (this.prisma[config.model] as any).findMany({
      where,
      orderBy: config.dateField ? { [config.dateField]: 'desc' } : undefined,
    });

    const csv = toCsv(rows);
    const datePart = new Date().toISOString().slice(0, 10);
    return { filename: `${entity}-${datePart}.csv`, csv };
  }
}
