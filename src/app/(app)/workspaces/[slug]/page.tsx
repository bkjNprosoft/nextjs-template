import { notFound, redirect } from "next/navigation";

import { ProjectBoard } from "@/components/projects/project-board";
import { ProjectCommentFeed } from "@/components/projects/project-comment-feed";
import { CreateProjectForm } from "@/components/projects/create-project-form";
import { ProjectSearch } from "@/components/projects/project-search";
import { MemberManagement } from "@/components/workspaces/member-management";
import { Badge } from "@/components/ui/badge";
import { auth } from "@/lib/auth";
import { getWorkspaceBySlug } from "@/server/data/workspaces";
import type { WorkspaceRole } from "@prisma/client";

type WorkspacePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const { slug } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  const workspace = await getWorkspaceBySlug(slug);

  if (!workspace) {
    notFound();
  }

  const isMember =
    workspace.owner.id === session.user.id ||
    workspace.members.some((member) => member.user.id === session.user.id);

  if (!isMember) {
    redirect("/dashboard");
  }

  const projectCards = workspace.projects.map((project) => ({
    id: project.id,
    title: project.title,
    summary: project.summary,
    status: project.status,
    priority: project.priority,
    dueDate: project.dueDate ? project.dueDate.toISOString() : null,
    ownerName: project.owner.name ?? project.owner.email ?? "Unassigned",
    commentCount: project._count.comments,
    tags: project.tags,
  }));

  const projectOptions = workspace.projects.map((project) => ({
    id: project.id,
    title: project.title,
  }));

  const recentComments = workspace.projects
    .flatMap((project) =>
      project.comments.map((comment) => ({
        id: comment.id,
        body: comment.body,
        projectTitle: project.title,
        authorName: comment.author.name ?? comment.author.email ?? "Unknown",
        createdAt: comment.createdAt,
        projectId: project.id,
      })),
    )
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 6);

  const currentUserRole: WorkspaceRole | "OWNER" =
    workspace.owner.id === session.user.id
      ? "OWNER"
      : workspace.members.find((m) => m.user.id === session.user.id)?.role ??
        "MEMBER";

  const members = workspace.members.map((member) => ({
    id: member.id,
    name: member.user.name,
    email: member.user.email,
    role: member.role,
    userId: member.user.id,
  }));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {workspace.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            Workspace owner:{" "}
            <span className="font-medium">{workspace.owner.name}</span>
          </p>
        </div>
        <Badge variant="outline">{workspace.members.length + 1} members</Badge>
      </div>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-6">
          <ProjectSearch workspaceSlug={workspace.slug} />
          <ProjectBoard projects={projectCards} />
        </div>
        <div className="space-y-6">
          <CreateProjectForm workspaceId={workspace.id} />
          <ProjectCommentFeed
            comments={recentComments}
            projects={projectOptions}
          />
        </div>
      </section>

      <MemberManagement
        workspaceId={workspace.id}
        owner={{
          id: workspace.owner.id,
          name: workspace.owner.name,
          email: workspace.owner.email,
        }}
        members={members}
        currentUserId={session.user.id}
        currentUserRole={currentUserRole}
      />
    </div>
  );
}

