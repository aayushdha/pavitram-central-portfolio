import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class UpdateCartItemDto {
  @ApiProperty({ description: 'New quantity. Sending 0 removes the item.' })
  @IsInt()
  @Min(0)
  qty: number;
}
