"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { supabase } from "@/lib/supabase/client";
import { cadastroSchema, type CadastroFormData } from "@/lib/validations/auth";

export default function CadastroPage() {
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
      "Cadastro realizado com sucesso! Verifique seu e-mail para confirmar sua conta.",
    );

    reset();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 py-12 text-white">
      <section className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900/70 p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <p className="mb-3 text-sm font-medium tracking-[0.3em] text-emerald-400 uppercase">
            Conta Clara
          </p>

          <h1 className="text-3xl font-bold tracking-tight">
            Crie sua conta grátis
          </h1>

          <p className="mt-3 text-sm text-zinc-400">
            Comece seu teste grátis de 30 dias e organize suas contas com mais
            clareza.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-zinc-200"
            >
              Nome completo
            </label>

            <input
              id="name"
              type="text"
              placeholder="Digite seu nome"
              {...register("name")}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white transition outline-none placeholder:text-zinc-500 focus:border-emerald-400"
            />

            {errors.name && (
              <p className="mt-2 text-sm text-red-400">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-zinc-200"
            >
              E-mail
            </label>

            <input
              id="email"
              type="email"
              placeholder="seuemail@exemplo.com"
              {...register("email")}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white transition outline-none placeholder:text-zinc-500 focus:border-emerald-400"
            />

            {errors.email && (
              <p className="mt-2 text-sm text-red-400">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-zinc-200"
            >
              Senha
            </label>

            <input
              id="password"
              type="password"
              placeholder="Crie uma senha segura"
              {...register("password")}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white transition outline-none placeholder:text-zinc-500 focus:border-emerald-400"
            />

            {errors.password && (
              <p className="mt-2 text-sm text-red-400">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-medium text-zinc-200"
            >
              Confirmar senha
            </label>

            <input
              id="confirmPassword"
              type="password"
              placeholder="Repita sua senha"
              {...register("confirmPassword")}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white transition outline-none placeholder:text-zinc-500 focus:border-emerald-400"
            />

            {errors.confirmPassword && (
              <p className="mt-2 text-sm text-red-400">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Criando conta..." : "Criar minha conta grátis"}
          </button>

          {statusMessage && (
            <p
              className={`rounded-xl px-4 py-3 text-center text-sm ${
                statusType === "success"
                  ? "bg-emerald-400/10 text-emerald-300"
                  : "bg-red-400/10 text-red-300"
              }`}
            >
              {statusMessage}
            </p>
          )}
        </form>

        <p className="mt-6 text-center text-sm text-zinc-400">
          Já tem uma conta?{" "}
          <a href="#" className="font-medium text-emerald-400 hover:underline">
            Entrar
          </a>
        </p>
      </section>
    </main>
  );
}
