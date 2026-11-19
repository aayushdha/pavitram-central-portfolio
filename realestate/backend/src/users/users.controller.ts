import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CentralAuthGuard, RequestUser } from '../common/guards/central-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { SubmitKycDocumentDto } from './dto/submit-kyc-document.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiBearerAuth()
  @UseGuards(CentralAuthGuard)
  @Get('me')
  findMe(@CurrentUser() user: RequestUser) {
    return this.usersService.findMe(user.id);
  }

  @ApiBearerAuth()
  @UseGuards(CentralAuthGuard)
  @Patch('me')
  updateProfile(@CurrentUser() user: RequestUser, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(CentralAuthGuard)
  @Patch('me/roles')
  updateRoles(@CurrentUser() user: RequestUser, @Body() dto: UpdateRoleDto) {
    return this.usersService.updateRoles(user, dto);
  }

  @ApiBearerAuth()
  @UseGuards(CentralAuthGuard)
  @Get('me/kyc-documents')
  findMyKycDocuments(@CurrentUser() user: RequestUser) {
    return this.usersService.findMyKycDocuments(user.id);
  }

  @ApiBearerAuth()
  @UseGuards(CentralAuthGuard)
  @Post('me/kyc-documents')
  submitKycDocument(@CurrentUser() user: RequestUser, @Body() dto: SubmitKycDocumentDto) {
    return this.usersService.submitKycDocument(user.id, dto);
  }

  @Get(':id')
  findPublicProfile(@Param('id') id: string) {
    return this.usersService.findPublicProfile(id);
  }
}
