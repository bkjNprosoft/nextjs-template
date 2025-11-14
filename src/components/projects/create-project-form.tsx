import { ProjectPriority } from "@prisma/client";

import { createProjectAction } from "@/server/actions/projects";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type CreateProjectFormProps = {
  workspaceId: string;
};

export function CreateProjectForm({ workspaceId }: CreateProjectFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>새 프로젝트</CardTitle>
        <CardDescription>
          목표를 정의하고 우선순위를 지정해 팀 협업을 시작하세요.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={createProjectAction} className="space-y-4">
          <input type="hidden" name="workspaceId" value={workspaceId} />
          <div className="space-y-2">
            <Label htmlFor="title">프로젝트 이름</Label>
            <Input
              id="title"
              name="title"
              placeholder="예: 모바일 온보딩 개편"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="summary">요약</Label>
            <Textarea
              id="summary"
              name="summary"
              placeholder="목표, 범위, 기대 효과 등을 간단히 작성하세요."
              rows={3}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="priority">우선순위</Label>
              <Select name="priority" defaultValue={ProjectPriority.MEDIUM}>
                <SelectTrigger id="priority">
                  <SelectValue placeholder="우선순위" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(ProjectPriority).map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {priority}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">마감일</Label>
              <Input id="dueDate" name="dueDate" type="date" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">태그</Label>
            <Input
              id="tags"
              name="tags"
              placeholder="design, onboarding, Q1"
            />
            <p className="text-xs text-muted-foreground">
              쉼표로 구분해 여러 태그를 추가할 수 있습니다.
            </p>
          </div>
          <Button type="submit" className="w-full">
            프로젝트 생성
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

