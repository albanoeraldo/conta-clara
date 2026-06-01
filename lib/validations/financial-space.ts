import { z } from "zod";

export const financialSpaceSchema = z.object({
  name: z.string().min(3, "Digite o nome do controle financeiro."),
  type: z.enum(["personal", "couple", "family", "business"], {
    message: "Selecione o tipo de uso.",
  }),
  monthlyIncome: z
    .string()
    .optional()
    .refine((value) => !value || Number(value) >= 0, {
      message: "A renda mensal não pode ser negativa.",
    }),
});

export type FinancialSpaceFormData = z.infer<typeof financialSpaceSchema>;
