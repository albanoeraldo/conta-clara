import { z } from "zod";

import { moneyInputToNumber } from "@/lib/utils/money";

export const creditCardPurchaseSchema = z
  .object({
    creditCardId: z.string().min(1, "Selecione um cartão."),

    description: z
      .string()
      .min(3, "A descrição precisa ter pelo menos 3 caracteres."),

    totalAmount: z
      .string()
      .min(1, "Informe o valor da compra.")
      .refine(
        (value) => moneyInputToNumber(value) > 0,
        "O valor da compra precisa ser maior que zero.",
      ),

    categoryId: z.string().optional(),

    purchaseDate: z.string().min(1, "Informe a data da compra."),

    installmentsTotal: z
      .string()
      .min(1, "Informe a quantidade de parcelas.")
      .refine((value) => {
        const total = Number(value);

        return Number.isInteger(total) && total >= 1;
      }, "A quantidade de parcelas precisa ser maior que zero."),

    firstInstallmentNumber: z
      .string()
      .min(1, "Informe o número da parcela inicial.")
      .refine((value) => {
        const number = Number(value);

        return Number.isInteger(number) && number >= 1;
      }, "A parcela inicial precisa ser maior que zero."),

    notes: z.string().optional(),
  })
  .refine(
    (data) =>
      Number(data.firstInstallmentNumber) <= Number(data.installmentsTotal),
    {
      path: ["firstInstallmentNumber"],
      message: "A parcela inicial não pode ser maior que o total de parcelas.",
    },
  );

export type CreditCardPurchaseFormData = z.infer<
  typeof creditCardPurchaseSchema
>;
