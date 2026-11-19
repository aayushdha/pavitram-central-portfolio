import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsString, Min } from 'class-validator';

export class CreateServiceBookingDto {
  @ApiProperty() @IsString() providerId: string;
  @ApiProperty() @IsString() serviceName: string;
  @ApiProperty() @IsDateString() scheduledAt: string;
  @ApiProperty() @IsInt() @Min(0) amount: number;
}
