import { SetMetadata } from "@nestjs/common";
import { MainRole } from "@prisma/client";

export const ROLES_KEY = "roles";

/** Restricts a route to the given roles, e.g. @Roles(MainRole.ADMIN, MainRole.SUPER_ADMIN) */
export const Roles = (...roles: MainRole[]) => SetMetadata(ROLES_KEY, roles);
