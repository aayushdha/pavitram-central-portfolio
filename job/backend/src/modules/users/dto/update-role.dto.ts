import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { SELF_SERVICE_ROLES, SelfServiceRole } from '../../auth/dto/register.dto';

export class UpdateRoleDto {
  @ApiProperty({ enum: SELF_SERVICE_ROLES, example: 'EMPLOYER' })
  @IsIn(SELF_SERVICE_ROLES)
  role: SelfServiceRole;
}
