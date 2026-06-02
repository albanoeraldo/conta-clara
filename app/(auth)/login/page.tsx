"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { LockKeyhole, Mail } from "lucide-react";

import { AuthShell } from "@/components/auth/auth-shell";
import { getUserFinancialSpaceId } from "@/lib/auth/financial-space";
import { getCurrentUser } from "@/lib/auth/session";
import { supabase } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function redirectAuthenticatedUser() {
      const user = await getCurrentUser();

      if (!user) {
        return;
      }

      const financialSpaceId = await getUserFinancialSpaceId(user.id);

      router.replace(financialSpaceId ? "/dashboard" : "/onboarding");
    }

    const timeoutId = window.setTimeout(() => {
      void redirectAuthenticatedUser();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");

    if (!email || !password) {
      setErrorMessage("Informe seu e-mail e sua senha para entrar.");
      return;
    }

    try {
      setIsSubmitting(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (!data.user) {
        throw new Error("Não foi possível validar o usuário.");
      }

      const financialSpaceId = await getUserFinancialSpaceId(data.user.id);

      router.replace(financialSpaceId ? "/dashboard" : "/onboarding");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Erro ao entrar na sua conta.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Bem-vindo de volta!"
      description="Entre na sua conta para continuar acompanhando suas receitas, despesas e contas do mês."
      footer={
        <p className="text-center text-sm text-slate-600">
          Ainda não tem uma conta?{" "}
          <Link
            href="/cadastro"
            className="font-bold text-blue-700 transition hover:text-blue-600"
          >
            Cadastre-se
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
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
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="seu@email.com"
              className="w-full rounded-2xl border border-slate-200 bg-white py-4 pr-4 pl-12 text-sm text-slate-950 transition outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>
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
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Digite sua senha"
              className="w-full rounded-2xl border border-slate-200 bg-white py-4 pr-4 pl-12 text-sm text-slate-950 transition outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>
        </div>

        {errorMessage && (
          <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-2xl bg-blue-600 px-6 py-4 text-sm font-black text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </AuthShell>
  );
}
