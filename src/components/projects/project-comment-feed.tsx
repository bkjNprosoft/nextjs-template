import { addProjectCommentAction } from "@/server/actions/projects";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type CommentItem = {
  id: string;
  body: string;
  authorName: string;
  projectTitle: string;
  createdAt: Date;
  projectId: string;
};

type ProjectOption = {
  id: string;
  title: string;
};

type ProjectCommentFeedProps = {
  comments: CommentItem[];
  projects: ProjectOption[];
};

export function ProjectCommentFeed({
  comments,
  projects,
}: ProjectCommentFeedProps) {
  const hasProjects = projects.length > 0;

  return (
    <Card className="border-muted-foreground/10">
      <CardHeader>
        <CardTitle>Collaboration Feed</CardTitle>
        <CardDescription>
          최근 논의된 업데이트와 맥락을 한곳에서 확인하세요.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form action={addProjectCommentAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="projectId">프로젝트 선택</Label>
            <select
              id="projectId"
              name="projectId"
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              required
              disabled={!hasProjects}
            >
              <option value="">
                {hasProjects ? "프로젝트를 선택하세요" : "먼저 프로젝트를 생성하세요"}
              </option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="body">코멘트</Label>
            <Textarea
              id="body"
              name="body"
              placeholder="결정 사항, 이슈, 다음 액션 등을 공유하세요."
              rows={3}
              required
              disabled={!hasProjects}
            />
          </div>
          <Button type="submit" className="w-full" disabled={!hasProjects}>
            코멘트 추가
          </Button>
          {!hasProjects ? (
            <p className="text-xs text-muted-foreground">
              코멘트를 남기려면 먼저 프로젝트를 만들어 주세요.
            </p>
          ) : null}
        </form>

        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              아직 코멘트가 없습니다. 주요 업데이트를 기록해 보세요.
            </p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {comment.authorName
                      ? comment.authorName
                          .split(" ")
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()
                      : "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">{comment.authorName}</p>
                    <span className="text-xs text-muted-foreground">
                      {comment.createdAt.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-primary">
                    {comment.projectTitle}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {comment.body}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

