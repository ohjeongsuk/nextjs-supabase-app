import { z } from "zod";

export const eventFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "이벤트 제목을 입력해주세요")
    .max(50, "제목은 최대 50자까지 입력할 수 있어요"),
  description: z
    .string()
    .trim()
    .max(500, "설명은 최대 500자까지 입력할 수 있어요")
    .optional()
    .or(z.literal("")),
  location: z
    .string()
    .trim()
    .min(1, "장소를 입력해주세요")
    .max(100, "장소는 최대 100자까지 입력할 수 있어요"),
  event_date: z.string().min(1, "날짜와 시간을 선택해주세요"),
  cover_image: z.union([z.instanceof(File), z.string(), z.null()]),
});

export type EventFormSchema = z.infer<typeof eventFormSchema>;
