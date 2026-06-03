import { z } from "zod";

import { moneyInputToNumber } from "@/lib/utils/money";

export const fixedExpenseSchema = z.object({
  description: z
    .string()
    .min(3, "A descrição precisa ter pelo menos 3 caracteres."),

  amount: z
    .string()
    .min(1, "Informe o valor previsto.")
    .refine(
      (value) => moneyInputToNumber(value) > 0,
      "O valor precisa ser maior que zero.",
    ),

  categoryId: z.string().optional(),

  dueDay: z
    .string()
    .min(1, "Informe o dia de vencimento.")
    .refine((value) => {
      const day = Number(value);

      return Number.isInteger(day) && day >= 1 && day <= 31;
    }, "O dia de vencimento precisa ser entre 1 e 31."),

  paymentMethod: z.enum(
    [
      "pix",
      "money",
      "debit",
      "credit_card",
      "bank_transfer",
      "boleto",
      "other",
    ],
    {
      message: "Selecione uma forma de pagamento válida.",
    },
  ),

  notes: z.string().optional(),
});

export type FixedExpenseFormData = z.infer<typeof fixedExpenseSchema>;
