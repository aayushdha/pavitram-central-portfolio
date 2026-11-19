import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { ReportsService } from './reports.service';

@ApiTags('reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Get()
  @ApiOperation({ summary: 'List which entities can be exported as a report' })
  listEntities() {
    return { entities: this.service.listEntities() };
  }

  @Get(':entity/export')
  @ApiOperation({ summary: 'Download a CSV export of an entity, optionally filtered by date range (?from=&to=)' })
  async export(
    @Param('entity') entity: string,
    @Query('from') from: string | undefined,
    @Query('to') to: string | undefined,
    @Res() res: Response
  ) {
    const { filename, csv } = await this.service.export(entity, { from, to });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  }
}
