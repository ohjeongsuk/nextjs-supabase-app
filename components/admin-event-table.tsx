"use client";

import { Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
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
import { deleteEventAsAdmin } from "@/lib/actions/admin";
import { cn } from "@/lib/utils";
import type {
  AdminEventListItem,
  EventStatus,
  EventStatusFilter,
} from "@/lib/types";

const statusLabels: Record<EventStatus, string> = {
  upcoming: "예정",
  ongoing: "진행 중",
  ended: "종료",
};

const filterTabs: { value: EventStatusFilter; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "upcoming", label: "예정" },
  { value: "ongoing", label: "진행 중" },
  { value: "ended", label: "종료" },
];

interface AdminEventTableProps {
  events: AdminEventListItem[];
}

export function AdminEventTable({ events }: AdminEventTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<EventStatusFilter>("all");
  const [targetEvent, setTargetEvent] = useState<AdminEventListItem | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredEvents = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return events.filter((event) => {
      const matchesStatus =
        statusFilter === "all" || event.status === statusFilter;
      const matchesKeyword =
        keyword.length === 0 ||
        event.title.toLowerCase().includes(keyword) ||
        event.host_name.toLowerCase().includes(keyword);
      return matchesStatus && matchesKeyword;
    });
  }, [events, search, statusFilter]);

  async function handleDelete() {
    if (!targetEvent) return;
    setIsDeleting(true);

    const result = await deleteEventAsAdmin(targetEvent.id);
    setIsDeleting(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("이벤트가 삭제되었어요");
    setTargetEvent(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="제목, 주최자로 검색"
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatusFilter(tab.value)}
              className={cn(
                "h-8 shrink-0 rounded-full border px-3 text-sm font-medium transition-colors",
                statusFilter === tab.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:bg-accent",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <EmptyState
          icon={Search}
          title="조건에 맞는 이벤트가 없어요"
          description="검색어나 필터를 변경해보세요"
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>제목</TableHead>
                <TableHead>주최자</TableHead>
                <TableHead>날짜</TableHead>
                <TableHead>참여자 수</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>생성일</TableHead>
                <TableHead className="text-right">삭제</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvents.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium text-foreground">
                    {event.title}
                  </TableCell>
                  <TableCell>{event.host_name}</TableCell>
                  <TableCell>
                    {new Date(event.event_date).toLocaleDateString("ko-KR")}
                  </TableCell>
                  <TableCell>{event.participant_count}명</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {statusLabels[event.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(event.created_at).toLocaleDateString("ko-KR")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="이벤트 삭제"
                      onClick={() => setTargetEvent(event)}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog
        open={targetEvent !== null}
        onOpenChange={(open) => !open && setTargetEvent(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>이벤트를 삭제할까요?</DialogTitle>
            <DialogDescription>
              &quot;{targetEvent?.title}&quot; 이벤트를 삭제하면 복구할 수
              없어요.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTargetEvent(null)}>
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
