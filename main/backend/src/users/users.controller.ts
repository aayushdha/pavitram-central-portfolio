import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { MainRole } from "@prisma/client";
import { UsersService } from "./users.service";
import { ProfileFormDto } from "./dto/profile-form.dto";
import { AdminUpdateUserDto } from "./dto/admin-update-user.dto";
import { AdminCreateUserDto } from "./dto/admin-create-user.dto";
import { Public } from "../common/decorators/public.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Public "Join the Community" membership form.
   * Matches the frontend's existing call to POST /api/v1/users/profile-form
   */
  @Public()
  @Post("profile-form")
  @HttpCode(HttpStatus.CREATED)
  submitProfileForm(@Body() dto: ProfileFormDto) {
    return this.usersService.submitProfileForm(dto);
  }
}

@Controller("admin/users")
@UseGuards(RolesGuard)
@Roles(MainRole.ADMIN, MainRole.SUPER_ADMIN)
export class AdminUsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  list(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("search") search?: string,
    @Query("role") role?: MainRole,
  ) {
    return this.usersService.adminList({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
      role,
    });
  }

  @Get(":id")
  get(@Param("id") id: string) {
    return this.usersService.adminGet(id);
  }

  @Post()
  create(@Body() dto: AdminCreateUserDto) {
    return this.usersService.adminCreate(dto);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() dto: AdminUpdateUserDto,
    @CurrentUser("role") role: MainRole,
  ) {
    return this.usersService.adminUpdate(id, dto, role);
  }

  @Delete(":id")
  remove(@Param("id") id: string, @CurrentUser("role") role: MainRole) {
    return this.usersService.adminDelete(id, role);
  }
}
