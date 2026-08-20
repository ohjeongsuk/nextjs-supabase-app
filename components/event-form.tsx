"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
import { Textarea } from "@/components/ui/textarea";
import { eventFormSchema, type EventFormSchema } from "@/lib/schemas/event";

interface EventFormProps {
  defaultValues?: Partial<EventFormSchema>;
  onSubmit: (values: EventFormSchema) => Promise<void> | void;
  submitLabel: string;
  pendingLabel: string;
}

export function EventForm({
  defaultValues,
  onSubmit,
  submitLabel,
  pendingLabel,
}: EventFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    typeof defaultValues?.cover_image === "string"
      ? defaultValues.cover_image
      : null,
  );

  const form = useForm<EventFormSchema>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      event_date: "",
      cover_image: null,
      ...defaultValues,
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  function handleCoverImageChange(file: File | null) {
    form.setValue("cover_image", file, { shouldValidate: true });
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  }

  async function handleSubmit(values: EventFormSchema) {
    try {
      await onSubmit(values);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "오류가 발생했습니다",
      );
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-6"
      >
        <FormField
          control={form.control}
          name="cover_image"
          render={() => (
            <FormItem>
              <FormLabel>커버 이미지</FormLabel>
              <FormControl>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      handleCoverImageChange(e.target.files?.[0] ?? null)
                    }
                  />
                  {previewUrl ? (
                    <div className="relative aspect-video w-full overflow-hidden rounded-md border">
                      <Image
                        src={previewUrl}
                        alt="커버 이미지 미리보기"
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleCoverImageChange(null)}
                        className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-background/80 text-foreground"
                        aria-label="커버 이미지 삭제"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed text-muted-foreground"
                    >
                      <ImagePlus className="size-6" />
                      <span className="text-sm">이미지 선택</span>
                    </button>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>제목</FormLabel>
              <FormControl>
                <Input placeholder="이벤트 제목을 입력하세요" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>설명 (선택)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="이벤트에 대해 설명해주세요"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="event_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>날짜 및 시간</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>장소</FormLabel>
              <FormControl>
                <Input placeholder="이벤트 장소를 입력하세요" {...field} />
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
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            취소
          </Button>
          <Button type="submit" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? pendingLabel : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
