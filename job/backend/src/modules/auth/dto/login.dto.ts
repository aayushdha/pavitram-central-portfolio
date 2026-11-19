import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'rahul@example.com', description: 'Email OR phone number' })
  @IsString()
  identifier: string;

  @ApiProperty({ example: 'MyPass123' })
  @IsString()
  @MinLength(6)
  password: string;
}
