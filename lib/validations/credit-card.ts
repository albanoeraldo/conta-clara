import { z } from "zod";

import { moneyInputToNumber } from "@/lib/utils/money";

export const creditCardSchema = z.object({
  name: z
    .string()
    .min(2, "O nome do cartão precisa ter pelo menos 2 caracteres."),

  nickname: z.string().optional(),

  limitAmount: z
    .string()
    .optional()
    .refine(
      (value) => !value || moneyInputToNumber(value) >= 0,
      "O limite não pode ser negativo.",
    ),

  closingDay: z
    .string()
    .min(1, "Informe o dia de fechamento.")
    .refine((value) => {
      const day = Number(value);

      return Number.isInteger(day) && day >= 1 && day <= 31;
    }, "O dia de fechamento precisa ser entre 1 e 31."),

  dueDay: z
    .string()
    .min(1, "Informe o dia de vencimento.")
    .refine((value) => {
      const day = Number(value);

      return Number.isInteger(day) && day >= 1 && day <= 31;
    }, "O dia de vencimento precisa ser entre 1 e 31."),

  brand: z.string().optional(),

  notes: z.string().optional(),
});

export type CreditCardFormData = z.infer<typeof creditCardSchema>;
