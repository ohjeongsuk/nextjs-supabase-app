"use client";

import { Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/empty-state";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteUserAsAdmin } from "@/lib/actions/admin";
import { cn } from "@/lib/utils";
import type { AdminUserListItem, UserRoleFilter } from "@/lib/types";

const roleLabels: Record<AdminUserListItem["role"], string> = {
  user: "일반 사용자",
  admin: "관리자",
};

const filterTabs: { value: UserRoleFilter; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "user", label: "일반 사용자" },
  { value: "admin", label: "관리자" },
];

interface AdminUserTableProps {
  users: AdminUserListItem[];
  currentUserId: string;
}

export function AdminUserTable({ users, currentUserId }: AdminUserTableProps) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRoleFilter>("all");
  const [targetUser, setTargetUser] = useState<AdminUserListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return users.filter((user) => {
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesKeyword =
        keyword.length === 0 ||
        user.name.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword);
      return matchesRole && matchesKeyword;
    });
  }, [users, search, roleFilter]);

  async function handleDelete() {
    if (!targetUser) return;
    setIsDeleting(true);

    const result = await deleteUserAsAdmin(targetUser.id);
    setIsDeleting(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("사용자가 삭제되었어요");
    setTargetUser(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="이름, 이메일로 검색"
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setRoleFilter(tab.value)}
              className={cn(
                "h-8 shrink-0 rounded-full border px-3 text-sm font-medium transition-colors",
                roleFilter === tab.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:bg-accent",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <EmptyState
          icon={Search}
          title="조건에 맞는 사용자가 없어요"
          description="검색어나 필터를 변경해보세요"
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>사용자</TableHead>
                <TableHead>역할</TableHead>
                <TableHead>가입일</TableHead>
                <TableHead>만든 이벤트</TableHead>
                <TableHead>참여한 이벤트</TableHead>
                <TableHead className="text-right">삭제</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => {
                const isSelf = user.id === currentUserId;
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="size-8">
                          <AvatarImage
                            src={user.avatar_url ?? undefined}
                            alt={user.name}
                          />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">
                            {user.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.role === "admin" ? "default" : "outline"}
                      >
                        {roleLabels[user.role]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString("ko-KR")}
                    </TableCell>
                    <TableCell>{user.events_created_count}개</TableCell>
                    <TableCell>{user.events_joined_count}개</TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="사용자 삭제"
                        disabled={isSelf}
                        title={isSelf ? "자신은 삭제할 수 없어요" : undefined}
                        onClick={() => setTargetUser(user)}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog
        open={targetUser !== null}
        onOpenChange={(open) => !open && setTargetUser(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>사용자를 삭제할까요?</DialogTitle>
            <DialogDescription>
              &quot;{targetUser?.name}&quot; 사용자를 삭제하면 복구할 수 없어요.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTargetUser(null)}>
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "삭제 중..." : "삭제"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
