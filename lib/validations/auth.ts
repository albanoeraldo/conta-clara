import { z } from "zod";

export const cadastroSchema = z
  .object({
    name: z.string().min(3, "Digite seu nome completo."),
    email: z.email({ message: "Digite um e-mail válido." }),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
    confirmPassword: z.string().min(6, "Confirme sua senha."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não conferem.",
    path: ["confirmPassword"],
  });

export type CadastroFormData = z.infer<typeof cadastroSchema>;

export const loginSchema = z.object({
  email: z.email({ message: "Digite um e-mail válido." }),
  password: z.string().min(1, "Digite sua senha."),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const onboardingSchema = z.object({
  spaceName: z.string().min(3, "Digite um nome para seu controle financeiro."),
  spaceType: z.enum(["personal", "couple", "family"], {
    message: "Selecione o tipo de uso.",
  }),
  monthlyIncome: z
    .string()
    .optional()
    .refine((value) => !value || Number(value) >= 0, {
      message: "A renda mensal não pode ser negativa.",
    }),
});

export type OnboardingFormData = z.infer<typeof onboardingSchema>;

export const transactionSchema = z.object({
  description: z.string().min(3, "Digite uma descrição para o lançamento."),
  amount: z
    .string()
    .min(1, "Digite o valor do lançamento.")
    .refine((value) => Number(value) > 0, {
      message: "O valor precisa ser maior que zero.",
    }),
  type: z.enum(["income", "expense"], {
    message: "Selecione o tipo do lançamento.",
  }),
  dueDate: z.string().min(1, "Informe a data de vencimento."),
  status: z.enum(["pending", "paid"], {
    message: "Selecione o status do lançamento.",
  }),
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
      message: "Selecione a forma de pagamento.",
    },
  ),
  notes: z.string().optional(),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;
