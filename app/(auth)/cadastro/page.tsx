"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { LockKeyhole, Mail, UserRound } from "lucide-react";
import { useForm } from "react-hook-form";

import { AuthShell } from "@/components/auth/auth-shell";
import { supabase } from "@/lib/supabase/client";
import { cadastroSchema, type CadastroFormData } from "@/lib/validations/auth";

export default function CadastroPage() {
  const router = useRouter();

  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "">("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CadastroFormData>({
    resolver: zodResolver(cadastroSchema),
  });

  async function onSubmit(data: CadastroFormData) {
    setStatusMessage("");
    setStatusType("");

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.name,
        },
      },
    });

    if (error) {
      setStatusType("error");
      setStatusMessage(error.message);
      return;
    }

    setStatusType("success");
    setStatusMessage(
      "Cadastro realizado com sucesso! Redirecionando para o login...",
    );

    reset();

    window.setTimeout(() => {
      router.replace("/login?created=1");
    }, 800);
  }

  return (
    <AuthShell
      title="Crie sua conta grátis"
      description="Comece organizando suas contas, vencimentos e despesas do mês em um painel simples e claro."
      illustrationSrc="/brand/conta-clara-register-cat.png"
      illustrationAlt="Mascote do Conta Clara planejando a organização financeira"
      visualTitle="Comece a organizar suas contas com mais clareza."
      visualDescription="Crie sua conta e dê o primeiro passo para acompanhar receitas, despesas, vencimentos e saldo previsto de um jeito simples."
      footer={
        <p className="text-center text-sm text-slate-600">
          Já tem uma conta?{" "}
          <Link
            href="/login"
            className="font-bold text-blue-700 transition hover:text-blue-600"
          >
            Entrar
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-bold text-slate-700"
          >
            Nome completo
          </label>

          <div className="relative">
            <UserRound className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400" />

            <input
              id="name"
              type="text"
              placeholder="Digite seu nome"
              {...register("name")}
              className="w-full rounded-2xl border border-slate-200 bg-blue-50/70 py-4 pr-4 pl-12 text-sm text-slate-950 transition outline-none placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </div>

          {errors.name && (
            <p className="mt-2 text-sm font-semibold text-red-500">
              {errors.name.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-bold text-slate-700"
          >
            E-mail
          </label>

          <div className="relative">
            <Mail className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400" />

            <input
              id="email"
              type="email"
              placeholder="seuemail@exemplo.com"
              {...register("email")}
              className="w-full rounded-2xl border border-slate-200 bg-blue-50/70 py-4 pr-4 pl-12 text-sm text-slate-950 transition outline-none placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </div>

          {errors.email && (
            <p className="mt-2 text-sm font-semibold text-red-500">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-bold text-slate-700"
          >
            Senha
          </label>

          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400" />

            <input
              id="password"
              type="password"
              placeholder="Crie uma senha segura"
              {...register("password")}
              className="w-full rounded-2xl border border-slate-200 bg-blue-50/70 py-4 pr-4 pl-12 text-sm text-slate-950 transition outline-none placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </div>

          {errors.password && (
            <p className="mt-2 text-sm font-semibold text-red-500">
              {errors.password.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-2 block text-sm font-bold text-slate-700"
          >
            Confirmar senha
          </label>

          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400" />

            <input
              id="confirmPassword"
              type="password"
              placeholder="Repita sua senha"
              {...register("confirmPassword")}
              className="w-full rounded-2xl border border-slate-200 bg-blue-50/70 py-4 pr-4 pl-12 text-sm text-slate-950 transition outline-none placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </div>

          {errors.confirmPassword && (
            <p className="mt-2 text-sm font-semibold text-red-500">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {statusMessage && statusType && (
          <div
            className={`rounded-2xl px-4 py-3 text-sm font-semibold ${
              statusType === "success"
                ? "bg-blue-50 text-blue-700"
                : "bg-red-50 text-red-600"
            }`}
          >
            {statusMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-2xl bg-blue-600 px-6 py-4 text-sm font-black text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Criando conta..." : "Criar minha conta grátis"}
        </button>
      </form>
    </AuthShell>
  );
}
