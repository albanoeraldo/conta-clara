import { z } from "zod";

import { moneyInputToNumber } from "@/lib/utils/money";

export const installmentPlanSchema = z
  .object({
    description: z
      .string()
      .min(3, "A descrição precisa ter pelo menos 3 caracteres."),

    installmentAmount: z
      .string()
      .min(1, "Informe o valor da parcela.")
      .refine(
        (value) => moneyInputToNumber(value) > 0,
        "O valor da parcela precisa ser maior que zero.",
      ),

    categoryId: z.string().optional(),

    firstDueDate: z.string().min(1, "Informe a data da primeira parcela."),

    totalInstallments: z
      .string()
      .min(1, "Informe o total de parcelas.")
      .refine((value) => {
        const total = Number(value);

        return Number.isInteger(total) && total >= 1;
      }, "O total de parcelas precisa ser maior que zero."),

    firstInstallmentNumber: z
      .string()
      .min(1, "Informe o número da primeira parcela.")
      .refine((value) => {
        const number = Number(value);

        return Number.isInteger(number) && number >= 1;
      }, "A primeira parcela precisa ser maior que zero."),

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
  })
  .refine(
    (data) =>
      Number(data.firstInstallmentNumber) <= Number(data.totalInstallments),
    {
      path: ["firstInstallmentNumber"],
      message: "A primeira parcela não pode ser maior que o total de parcelas.",
    },
  );

export type InstallmentPlanFormData = z.infer<typeof installmentPlanSchema>;
