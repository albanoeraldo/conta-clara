import { z } from "zod";

export const profileSchema = z.object({
  fullName: z.string().min(3, "Digite seu nome completo."),
  phone: z.string().optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
