"use client";

import { useState, useTransition } from "react";
import { MoreVertical, Trash2, UserPlus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  inviteWorkspaceMemberAction,
  removeWorkspaceMemberAction,
  updateWorkspaceMemberRoleAction,
} from "@/server/actions/workspaces";
import type { WorkspaceRole } from "@prisma/client";

type WorkspaceMember = {
  id: string;
  name: string | null;
  email: string | null;
  role: WorkspaceRole | "OWNER";
  userId: string;
};

type MemberManagementProps = {
  workspaceId: string;
  owner: {
    id: string;
    name: string | null;
    email: string | null;
  };
  members: WorkspaceMember[];
  currentUserId: string;
  currentUserRole: WorkspaceRole | "OWNER";
};

export function MemberManagement({
  workspaceId,
  owner,
  members,
  currentUserId,
  currentUserRole,
}: MemberManagementProps) {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [inviteError, setInviteError] = useState<string | null>(null);

  const canInvite = currentUserRole === "OWNER";
  const canManage = currentUserRole === "OWNER" || currentUserRole === "ADMIN";

  const handleInvite = async (formData: FormData) => {
    setInviteError(null);
    startTransition(async () => {
      const result = await inviteWorkspaceMemberAction(formData);
      if (result.success) {
        setIsInviteOpen(false);
      } else {
        const errorMessage =
          result.errors.email?.[0] ||
          result.errors._general?.[0] ||
          "멤버 초대에 실패했습니다.";
        setInviteError(errorMessage);
      }
    });
  };

  const handleRemove = (memberId: string) => {
    if (!confirm("정말 이 멤버를 제거하시겠습니까?")) {
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("workspaceId", workspaceId);
      formData.append("memberId", memberId);
      await removeWorkspaceMemberAction(formData);
    });
  };

  const handleRoleChange = (memberId: string, newRole: WorkspaceRole) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("workspaceId", workspaceId);
      formData.append("memberId", memberId);
      formData.append("role", newRole);
      await updateWorkspaceMemberRoleAction(formData);
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Members</CardTitle>
            <CardDescription>
              워크스페이스 멤버를 관리하고 권한을 설정하세요.
            </CardDescription>
          </div>
          {canInvite && (
            <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <UserPlus className="mr-2 h-4 w-4" />
                  멤버 초대
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form action={handleInvite}>
                  <input type="hidden" name="workspaceId" value={workspaceId} />
                  <DialogHeader>
                    <DialogTitle>멤버 초대</DialogTitle>
                    <DialogDescription>
                      이메일 주소로 워크스페이스 멤버를 초대합니다.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">이메일</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="user@example.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">역할</Label>
                      <Select name="role" defaultValue="MEMBER">
                        <SelectTrigger id="role">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MEMBER">Member</SelectItem>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {inviteError && (
                      <p className="text-sm text-destructive">{inviteError}</p>
                    )}
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsInviteOpen(false)}
                    >
                      취소
                    </Button>
                    <Button type="submit" disabled={isPending}>
                      {isPending ? "초대 중..." : "초대"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-4">
          <WorkspaceMemberRow
            name={owner.name}
            email={owner.email}
            badge="OWNER"
            isOwner
          />
          <Separator />
          {members
            .filter((member) => member.userId !== owner.id)
            .map((member) => (
              <WorkspaceMemberRow
                key={member.id}
                name={member.name}
                email={member.email}
                badge={member.role}
                canManage={canManage && member.userId !== currentUserId}
                onRemove={() => handleRemove(member.id)}
                onRoleChange={(newRole) =>
                  handleRoleChange(member.id, newRole)
                }
                currentRole={member.role}
              />
            ))}
          {members.filter((member) => member.userId !== owner.id).length ===
            0 && (
            <p className="text-sm text-muted-foreground">
              추가된 멤버가 없습니다.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

type WorkspaceMemberRowProps = {
  name: string | null;
  email: string | null;
  badge: string;
  isOwner?: boolean;
  canManage?: boolean;
  onRemove?: () => void;
  onRoleChange?: (role: WorkspaceRole) => void;
  currentRole?: WorkspaceRole;
};

function WorkspaceMemberRow({
  name,
  email,
  badge,
  isOwner = false,
  canManage = false,
  onRemove,
  onRoleChange,
  currentRole,
}: WorkspaceMemberRowProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex flex-col">
        <span className="text-sm font-medium">
          {name ?? email ?? "Unknown member"}
        </span>
        <span className="text-xs text-muted-foreground">
          {email ?? "No email on record"}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {canManage && !isOwner && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onRoleChange && currentRole && (
                <>
                  <DropdownMenuItem
                    onClick={() => onRoleChange("MEMBER")}
                    disabled={currentRole === "MEMBER"}
                  >
                    Member로 변경
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onRoleChange("ADMIN")}
                    disabled={currentRole === "ADMIN"}
                  >
                    Admin으로 변경
                  </DropdownMenuItem>
                </>
              )}
              {onRemove && (
                <DropdownMenuItem
                  onClick={onRemove}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  제거
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <Badge variant="secondary" className="uppercase tracking-wide">
          {badge}
        </Badge>
      </div>
    </div>
  );
}

