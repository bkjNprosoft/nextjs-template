import "server-only";

import { cache } from "react";

import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";

export const getWorkspaceBySlug = cache((slug: string) =>
  prisma.workspace.findUnique({
    where: { slug },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      members: {
        select: {
          id: true,
          role: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      },
      projects: {
        orderBy: { createdAt: "desc" },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          tags: {
            select: {
              id: true,
              value: true,
            },
          },
          comments: {
            orderBy: { createdAt: "desc" },
            take: 5,
            select: {
              id: true,
              body: true,
              createdAt: true,
              author: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          _count: {
            select: {
              comments: true,
            },
          },
        },
      },
    },
  }),
);

export function listWorkspacesForUser(userId: string) {
  return prisma.workspace.findMany({
    where: {
      OR: [
        { ownerId: userId },
        {
          members: {
            some: {
              userId,
            },
          },
        },
      ],
    },
    orderBy: { createdAt: "asc" },
  });
}

type CreateWorkspaceInput = {
  name: string;
  ownerId: string;
};

export async function createWorkspace({ name, ownerId }: CreateWorkspaceInput) {
  const baseSlug = slugify(name) || "workspace";
  const existingCount = await prisma.workspace.count({
    where: { slug: { startsWith: baseSlug } },
  });
  const slug =
    existingCount > 0 ? `${baseSlug}-${existingCount + 1}` : baseSlug;

  return prisma.workspace.create({
    data: {
      name,
      slug,
      ownerId,
      members: {
        create: {
          userId: ownerId,
          role: "OWNER",
        },
      },
    },
  });
}

