import "server-only";

import { UserRole } from "@prisma/client";

import { auth } from "@/shared/lib/auth";

const ROLE_PRIORITY: Record<UserRole, number> = {
  [UserRole.CUSTOMER]: 1,
  [UserRole.ADMIN]: 2,
};

type RoleRequirement = UserRole | ReadonlyArray<UserRole> | Set<UserRole>;

function isRoleArray(
  value: RoleRequirement,
): value is ReadonlyArray<UserRole> {
  return Array.isArray(value);
}

function toRoleArray(required: RoleRequirement): UserRole[] {
  if (isRoleArray(required)) {
    return [...required];
  }

  if (required instanceof Set) {
    return Array.from(required);
  }

  return [required];
}

export async function requireUser() {
  const session = await auth();

  if (!session?.user) {
    throw new Error("User is not authenticated.");
  }

  return session.user;
}

export function hasRequiredRole(
  currentRole: UserRole,
  required: RoleRequirement,
) {
  const requiredRoles = toRoleArray(required);

  return requiredRoles.some(
    (role) => ROLE_PRIORITY[currentRole] >= ROLE_PRIORITY[role],
  );
}

export async function requireRole(required: RoleRequirement) {
  const user = await requireUser();

  if (!hasRequiredRole(user.role, required)) {
    throw new Error("User does not have the required role.");
  }

  return user;
}

