"use server";

import { ProjectPriority, ProjectStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createProjectSchema = z.object({
  workspaceId: z.string().cuid(),
  title: z.string().min(3, "프로젝트 이름을 입력해 주세요."),
  summary: z
    .string()
    .max(400, "요약은 400자 이하로 입력해 주세요.")
    .optional()
    .or(z.literal("")),
  priority: z.nativeEnum(ProjectPriority),
  dueDate: z
    .string()
    .optional()
    .transform((value) => (value ? new Date(value) : undefined)),
  tags: z
    .string()
    .optional()
    .transform((value) =>
      value
        ? value
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : [],
    ),
});

const updateStatusSchema = z.object({
  projectId: z.string().cuid(),
  status: z.nativeEnum(ProjectStatus),
});

const tagSchema = z.object({
  projectId: z.string().cuid(),
  value: z
    .string()
    .trim()
    .min(2, "태그는 두 글자 이상이어야 합니다.")
    .max(24, "태그는 24자 이하로 입력해 주세요."),
});

const commentSchema = z.object({
  projectId: z.string().cuid(),
  body: z
    .string()
    .trim()
    .min(3, "코멘트는 최소 3자 이상이어야 합니다.")
    .max(500, "코멘트는 500자 이하로 입력해 주세요."),
});

async function requireAuthUser() {
  const session = await auth();

  if (!session?.user) {
    throw new Error("로그인이 필요합니다.");
  }

  return session.user;
}

async function ensureWorkspaceAccess(workspaceId: string, userId: string) {
  const workspace = await prisma.workspace.findFirst({
    where: {
      id: workspaceId,
      OR: [{ ownerId: userId }, { members: { some: { userId } } }],
    },
    select: {
      id: true,
      slug: true,
    },
  });

  if (!workspace) {
    throw new Error("해당 워크스페이스에 대한 권한이 없습니다.");
  }

  return workspace;
}

async function ensureProjectAccess(projectId: string, userId: string) {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      workspace: {
        OR: [{ ownerId: userId }, { members: { some: { userId } } }],
      },
    },
    select: {
      id: true,
      workspaceId: true,
      workspace: {
        select: {
          slug: true,
        },
      },
    },
  });

  if (!project) {
    throw new Error("프로젝트를 찾을 수 없거나 권한이 없습니다.");
  }

  return project;
}

export async function createProjectAction(formData: FormData) {
  const user = await requireAuthUser();

  const parsed = createProjectSchema.safeParse({
    workspaceId: formData.get("workspaceId") ?? "",
    title: formData.get("title") ?? "",
    summary: formData.get("summary") ?? "",
    priority: formData.get("priority") ?? ProjectPriority.MEDIUM,
    dueDate: formData.get("dueDate") ?? undefined,
    tags: formData.get("tags") ?? "",
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "입력값을 확인해 주세요.");
  }

  const payload = parsed.data;
  const workspace = await ensureWorkspaceAccess(payload.workspaceId, user.id);

  await prisma.project.create({
    data: {
      workspaceId: payload.workspaceId,
      ownerId: user.id,
      title: payload.title,
      summary: payload.summary || null,
      priority: payload.priority,
      dueDate: payload.dueDate,
      tags: payload.tags.length
        ? {
            createMany: {
              data: payload.tags.map((tag) => ({ value: tag })),
              skipDuplicates: true,
            },
          }
        : undefined,
    },
  });

  revalidatePath(`/workspaces/${workspace.slug}`);
}

export async function updateProjectStatusAction(formData: FormData) {
  const user = await requireAuthUser();

  const parsed = updateStatusSchema.safeParse({
    projectId: formData.get("projectId") ?? "",
    status: formData.get("status") ?? "",
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "입력값을 확인해 주세요.");
  }

  const project = await ensureProjectAccess(parsed.data.projectId, user.id);

  await prisma.project.update({
    where: { id: parsed.data.projectId },
    data: {
      status: parsed.data.status,
    },
  });

  revalidatePath(`/workspaces/${project.workspace.slug}`);
}

export async function addProjectTagAction(formData: FormData) {
  const user = await requireAuthUser();

  const parsed = tagSchema.safeParse({
    projectId: formData.get("projectId") ?? "",
    value: formData.get("tag") ?? "",
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "태그를 확인해 주세요.");
  }

  const project = await ensureProjectAccess(parsed.data.projectId, user.id);

  await prisma.projectTag.create({
    data: {
      projectId: parsed.data.projectId,
      value: parsed.data.value,
    },
  });

  revalidatePath(`/workspaces/${project.workspace.slug}`);
}

export async function addProjectCommentAction(formData: FormData) {
  const user = await requireAuthUser();

  const parsed = commentSchema.safeParse({
    projectId: formData.get("projectId") ?? "",
    body: formData.get("body") ?? "",
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "코멘트를 확인해 주세요.");
  }

  const project = await ensureProjectAccess(parsed.data.projectId, user.id);

  await prisma.projectComment.create({
    data: {
      projectId: parsed.data.projectId,
      authorId: user.id,
      body: parsed.data.body,
    },
  });

  revalidatePath(`/workspaces/${project.workspace.slug}`);
}

