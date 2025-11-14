import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspace = await prisma.workspace.findFirst({
    where: {
      slug,
      OR: [{ ownerId: session.user.id }, { members: { some: { userId: session.user.id } } }],
    },
    select: { id: true },
  });

  if (!workspace) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query")?.trim() ?? "";

  if (!query) {
    return NextResponse.json({ projects: [] });
  }

  const projects = await prisma.project.findMany({
    where: {
      workspaceId: workspace.id,
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { summary: { contains: query, mode: "insensitive" } },
        {
          tags: {
            some: { value: { contains: query, mode: "insensitive" } },
          },
        },
      ],
    },
    orderBy: { updatedAt: "desc" },
    take: 8,
    select: {
      id: true,
      title: true,
      status: true,
      priority: true,
      tags: {
        select: { value: true },
      },
    },
  });

  return NextResponse.json({ projects });
}

