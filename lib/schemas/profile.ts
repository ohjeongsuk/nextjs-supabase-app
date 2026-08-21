import { z } from "zod";

export const profileFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "이름을 입력해주세요")
    .max(50, "이름은 최대 50자까지 입력할 수 있어요"),
});

export type ProfileFormSchema = z.infer<typeof profileFormSchema>;
