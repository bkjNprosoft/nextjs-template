import { ProjectPriority, ProjectStatus } from "@prisma/client";

import { addProjectTagAction, updateProjectStatusAction } from "@/server/actions/projects";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ProjectTag = {
  id: string;
  value: string;
};

export type ProjectCard = {
  id: string;
  title: string;
  summary: string | null;
  status: ProjectStatus;
  priority: ProjectPriority;
  dueDate: string | null;
  ownerName: string;
  commentCount: number;
  tags: ProjectTag[];
};

type ProjectBoardProps = {
  projects: ProjectCard[];
};

const statusColumns: Array<{ value: ProjectStatus; label: string; helper: string }> =
  [
    { value: ProjectStatus.BACKLOG, label: "Backlog", helper: "정의 및 우선순위" },
    {
      value: ProjectStatus.IN_PROGRESS,
      label: "In Progress",
      helper: "실행 중",
    },
    { value: ProjectStatus.REVIEW, label: "Review", helper: "검토 및 QA" },
    { value: ProjectStatus.BLOCKED, label: "Blocked", helper: "이슈 해결 필요" },
    { value: ProjectStatus.SHIPPED, label: "Shipped", helper: "출시 완료" },
  ];

const statusOptions = Object.values(ProjectStatus);

const priorityColorMap: Record<ProjectPriority, string> = {
  [ProjectPriority.LOW]: "bg-emerald-100 text-emerald-700",
  [ProjectPriority.MEDIUM]: "bg-sky-100 text-sky-700",
  [ProjectPriority.HIGH]: "bg-amber-100 text-amber-700",
  [ProjectPriority.CRITICAL]: "bg-red-100 text-red-700",
};

export function ProjectBoard({ projects }: ProjectBoardProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
      {statusColumns.map((column) => {
        const columnProjects = projects.filter(
          (project) => project.status === column.value,
        );

        return (
          <Card key={column.value} className="border-muted-foreground/10">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{column.label}</CardTitle>
                <CardDescription>{column.helper}</CardDescription>
              </div>
              <Badge variant="outline">{columnProjects.length}</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              {columnProjects.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  아직 이 열에 속한 항목이 없습니다.
                </p>
              ) : (
                columnProjects.map((project) => (
                  <article
                    key={project.id}
                    className="space-y-3 rounded-lg border border-muted-foreground/20 bg-card/80 p-4 shadow-sm transition hover:border-primary/40"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-semibold leading-tight">
                          {project.title}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          담당: {project.ownerName}
                        </p>
                      </div>
                      <Badge className={priorityColorMap[project.priority]}>
                        {project.priority}
                      </Badge>
                    </div>
                    {project.summary ? (
                      <p className="text-sm text-muted-foreground">
                        {project.summary}
                      </p>
                    ) : null}
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <Badge key={tag.id} variant="secondary">
                          #{tag.value}
                        </Badge>
                      ))}
                      {project.tags.length === 0 ? (
                        <span className="text-xs text-muted-foreground">
                          태그가 없습니다.
                        </span>
                      ) : null}
                    </div>
                    <div className="grid gap-3 text-xs">
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>
                          댓글 {project.commentCount}개 ·{" "}
                          {project.dueDate
                            ? `마감 ${new Date(
                                project.dueDate,
                              ).toLocaleDateString()}`
                            : "마감일 미정"}
                        </span>
                        <form action={updateProjectStatusAction}>
                          <input
                            type="hidden"
                            name="projectId"
                            value={project.id}
                          />
                          <Label htmlFor={`status-${project.id}`} className="sr-only">
                            상태 변경
                          </Label>
                          <select
                            id={`status-${project.id}`}
                            name="status"
                            defaultValue={project.status}
                            className="rounded-md border border-input bg-background px-2 py-1 text-xs"
                          >
                            {statusOptions.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                          <Button
                            type="submit"
                            size="sm"
                            variant="ghost"
                            className="ml-2 h-8 text-xs text-primary"
                          >
                            업데이트
                          </Button>
                        </form>
                      </div>
                      <form
                        action={addProjectTagAction}
                        className="flex items-center gap-2"
                      >
                        <input type="hidden" name="projectId" value={project.id} />
                        <Label htmlFor={`tag-${project.id}`} className="sr-only">
                          태그 추가
                        </Label>
                        <Input
                          id={`tag-${project.id}`}
                          name="tag"
                          placeholder="태그 추가"
                          className="h-8 text-xs"
                        />
                        <Button type="submit" size="sm" variant="secondary">
                          추가
                        </Button>
                      </form>
                    </div>
                  </article>
                ))
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

