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
