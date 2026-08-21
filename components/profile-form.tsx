"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LogoutButton } from "@/components/logout-button";
import { updateProfile } from "@/lib/actions/profile";
import {
  profileFormSchema,
  type ProfileFormSchema,
} from "@/lib/schemas/profile";
import type { User } from "@/lib/types";

interface ProfileFormProps {
  user: User;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const displayName = user.name ?? "이름 없음";

  const form = useForm<ProfileFormSchema>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { name: user.name ?? "" },
  });

  async function handleSubmit(values: ProfileFormSchema) {
    const result = await updateProfile(values);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("프로필이 수정되었어요");
    setIsEditing(false);
  }

  const joinedAt = new Date(user.created_at).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-3">
        <Avatar size="lg" className="size-20">
          <AvatarImage src={user.avatar_url ?? undefined} alt={displayName} />
          <AvatarFallback className="text-xl">
            {displayName.charAt(0)}
          </AvatarFallback>
        </Avatar>
      </div>

      {isEditing ? (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>이름</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  form.reset({ name: user.name ?? "" });
                  setIsEditing(false);
                }}
              >
                취소
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={form.formState.isSubmitting}
              >
                저장
              </Button>
            </div>
          </form>
        </Form>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-md border p-3">
            <div>
              <p className="text-xs text-muted-foreground">이름</p>
              <p className="text-foreground">{displayName}</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setIsEditing(true)}
              aria-label="이름 수정"
            >
              <Pencil className="size-4" />
            </Button>
          </div>

          <div className="rounded-md border p-3">
            <p className="text-xs text-muted-foreground">이메일</p>
            <p className="text-foreground">{user.email}</p>
          </div>

          <div className="rounded-md border p-3">
            <p className="text-xs text-muted-foreground">가입일</p>
            <p className="text-foreground">{joinedAt}</p>
          </div>
        </div>
      )}

      <LogoutButton className="w-full" />
    </div>
  );
}
