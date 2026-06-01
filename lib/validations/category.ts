import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(3, "Digite o nome da categoria."),
  type: z.enum(["income", "expense"], {
    message: "Selecione o tipo da categoria.",
  }),
});

export type CategoryFormData = z.infer<typeof categorySchema>;
