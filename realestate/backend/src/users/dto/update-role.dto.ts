import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional } from 'class-validator';
import { RealRole } from '@prisma/client';

export class UpdateRoleDto {
  @ApiPropertyOptional({
    enum: RealRole,
    isArray: true,
    description:
      'Functional role(s) to add for this account, e.g. becoming an OWNER after ' +
      'previously only being a SEEKER. ADMIN cannot be self-assigned — it is only ' +
      'ever granted by the central auth service marking the account as ADMIN/SUPER_ADMIN.',
    example: [RealRole.SEEKER, RealRole.OWNER],
  })
  @IsArray()
  @IsEnum(RealRole, { each: true })
  @IsOptional()
  roles?: RealRole[];
}
