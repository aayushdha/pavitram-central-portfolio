import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SubmitKycDocumentDto {
  @ApiProperty({ example: 'RERA_CERTIFICATE' }) @IsString() docType: string;
  @ApiProperty() @IsString() docUrl: string;
}
