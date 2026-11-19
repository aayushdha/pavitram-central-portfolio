import { ApiProperty } from '@nestjs/swagger';
import { IsDefined } from 'class-validator';

export class UpsertSiteContentDto {
  @ApiProperty({ description: 'Any JSON-serializable value — object or array, shape depends on the section' })
  @IsDefined()
  value: any;
}
