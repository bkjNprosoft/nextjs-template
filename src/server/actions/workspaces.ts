"use server";

import type { Workspace, WorkspaceRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/server/auth";
import { createWorkspace } from "@/server/data/workspaces";

const createWorkspaceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Workspace name is required." })
    .min(2, { message: "Workspace name must be at least 2 characters." })
    .max(64, { message: "Workspace name must be 64 characters or fewer." }),
});

export type CreateWorkspaceState =
  | {
      success: false;
      errors: Record<string, string[]>;
    }
  | {
      success: true;
      workspace: Workspace;
    };

export const initialCreateWorkspaceState: CreateWorkspaceState = {
  success: false,
  errors: {},
};

export async function createWorkspaceAction(
  _prev: CreateWorkspaceState,
  formData: FormData,
): Promise<CreateWorkspaceState> {
  const parsed = createWorkspaceSchema.safeParse({
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return {
      success: false as const,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const user = await requireUser();

  const workspace = await createWorkspace({
    name: parsed.data.name,
    ownerId: user.id,
  });

  revalidatePath("/dashboard");

  return {
    success: true as const,
    workspace,
  };
}

async function getWorkspaceMemberRole(
  workspaceId: string,
  userId: string,
): Promise<WorkspaceRole | null> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { ownerId: true },
  });

  if (!workspace) {
    return null;
  }

  if (workspace.ownerId === userId) {
    return "OWNER";
  }

  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
    select: { role: true },
  });

  return member?.role ?? null;
}

async function ensureWorkspacePermission(
  workspaceId: string,
  userId: string,
  requiredRole: WorkspaceRole,
): Promise<void> {
  const userRole = await getWorkspaceMemberRole(workspaceId, userId);

  if (!userRole) {
    throw new Error("워크스페이스에 대한 권한이 없습니다.");
  }

  const rolePriority: Record<WorkspaceRole, number> = {
    MEMBER: 1,
    ADMIN: 2,
    OWNER: 3,
  };

  if (rolePriority[userRole] < rolePriority[requiredRole]) {
    throw new Error("이 작업을 수행할 권한이 없습니다.");
  }
}

const inviteMemberSchema = z.object({
  workspaceId: z.string().min(1),
  email: z.string().email({ message: "유효한 이메일 주소를 입력해주세요." }),
  role: z.enum(["MEMBER", "ADMIN"]),
});

export async function inviteWorkspaceMemberAction(formData: FormData) {
  const user = await requireUser();

  const parsed = inviteMemberSchema.safeParse({
    workspaceId: formData.get("workspaceId"),
    email: formData.get("email"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return {
      success: false as const,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await ensureWorkspacePermission(parsed.data.workspaceId, user.id, "OWNER");

    const targetUser = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });

    if (!targetUser) {
      return {
        success: false as const,
        errors: {
          email: ["해당 이메일로 가입된 사용자를 찾을 수 없습니다."],
        },
      };
    }

    const existingMember = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: parsed.data.workspaceId,
          userId: targetUser.id,
        },
      },
    });

    if (existingMember) {
      return {
        success: false as const,
        errors: {
          email: ["이미 워크스페이스 멤버입니다."],
        },
      };
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id: parsed.data.workspaceId },
      select: { ownerId: true },
    });

    if (workspace?.ownerId === targetUser.id) {
      return {
        success: false as const,
        errors: {
          email: ["워크스페이스 소유자는 이미 멤버입니다."],
        },
      };
    }

    await prisma.workspaceMember.create({
      data: {
        workspaceId: parsed.data.workspaceId,
        userId: targetUser.id,
        role: parsed.data.role,
      },
    });

    const workspaceSlug = await prisma.workspace.findUnique({
      where: { id: parsed.data.workspaceId },
      select: { slug: true },
    });

    if (workspaceSlug) {
      revalidatePath(`/workspaces/${workspaceSlug.slug}`);
    }

    return {
      success: true as const,
    };
  } catch (error) {
    return {
      success: false as const,
      errors: {
        _general: [
          error instanceof Error ? error.message : "멤버 초대에 실패했습니다.",
        ],
      },
    };
  }
}

const updateMemberRoleSchema = z.object({
  workspaceId: z.string().min(1),
  memberId: z.string().min(1),
  role: z.enum(["MEMBER", "ADMIN"]),
});

export async function updateWorkspaceMemberRoleAction(formData: FormData) {
  const user = await requireUser();

  const parsed = updateMemberRoleSchema.safeParse({
    workspaceId: formData.get("workspaceId"),
    memberId: formData.get("memberId"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return {
      success: false as const,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await ensureWorkspacePermission(parsed.data.workspaceId, user.id, "ADMIN");

    const member = await prisma.workspaceMember.findUnique({
      where: { id: parsed.data.memberId },
      select: { workspaceId: true },
    });

    if (!member || member.workspaceId !== parsed.data.workspaceId) {
      return {
        success: false as const,
        errors: {
          _general: ["멤버를 찾을 수 없습니다."],
        },
      };
    }

    await prisma.workspaceMember.update({
      where: { id: parsed.data.memberId },
      data: { role: parsed.data.role },
    });

    const workspaceSlug = await prisma.workspace.findUnique({
      where: { id: parsed.data.workspaceId },
      select: { slug: true },
    });

    if (workspaceSlug) {
      revalidatePath(`/workspaces/${workspaceSlug.slug}`);
    }

    return {
      success: true as const,
    };
  } catch (error) {
    return {
      success: false as const,
      errors: {
        _general: [
          error instanceof Error
            ? error.message
            : "역할 변경에 실패했습니다.",
        ],
      },
    };
  }
}

const removeMemberSchema = z.object({
  workspaceId: z.string().min(1),
  memberId: z.string().min(1),
});

export async function removeWorkspaceMemberAction(formData: FormData) {
  const user = await requireUser();

  const parsed = removeMemberSchema.safeParse({
    workspaceId: formData.get("workspaceId"),
    memberId: formData.get("memberId"),
  });

  if (!parsed.success) {
    return {
      success: false as const,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await ensureWorkspacePermission(parsed.data.workspaceId, user.id, "OWNER");

    const member = await prisma.workspaceMember.findUnique({
      where: { id: parsed.data.memberId },
      select: { workspaceId: true, userId: true },
    });

    if (!member || member.workspaceId !== parsed.data.workspaceId) {
      return {
        success: false as const,
        errors: {
          _general: ["멤버를 찾을 수 없습니다."],
        },
      };
    }

    if (member.userId === user.id) {
      return {
        success: false as const,
        errors: {
          _general: ["자기 자신을 제거할 수 없습니다."],
        },
      };
    }

    await prisma.workspaceMember.delete({
      where: { id: parsed.data.memberId },
    });

    const workspaceSlug = await prisma.workspace.findUnique({
      where: { id: parsed.data.workspaceId },
      select: { slug: true },
    });

    if (workspaceSlug) {
      revalidatePath(`/workspaces/${workspaceSlug.slug}`);
    }

    return {
      success: true as const,
    };
  } catch (error) {
    return {
      success: false as const,
      errors: {
        _general: [
          error instanceof Error ? error.message : "멤버 제거에 실패했습니다.",
        ],
      },
    };
  }
}

